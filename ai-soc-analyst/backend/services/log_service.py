import csv
import io
import uuid
import logging
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile
from backend.core.config import settings
from backend.models.log_entry import LogEntry
from backend.models.alert import Alert
from ml.pipeline.predict import IDSPredictor
from backend.schemas.log_entry import LogUploadResponse

logger = logging.getLogger(__name__)

# Initialize ML Predictor
predictor = IDSPredictor(
    model_path=settings.ML_MODEL_PATH,
    scaler_path=settings.ML_SCALER_PATH
)

class LogService:
    @staticmethod
    async def process_csv_upload(
        file: UploadFile,
        db: AsyncSession
    ) -> LogUploadResponse:
        contents = await file.read()
        decoded = contents.decode("utf-8-sig") # Handles BOM markers
        csv_file = io.StringIO(decoded)
        
        # Read headers and handle spacing issues common in CICIDS2017
        reader = csv.DictReader(csv_file)
        headers = [h.strip() for h in reader.fieldnames] if reader.fieldnames else []
        
        upload_id = str(uuid.uuid4())
        total_processed = 0
        anomalies_detected = 0
        alerts_created = []
        
        # Re-initialize dict reader with stripped fieldnames
        csv_file.seek(0)
        next(csv_file) # skip header line
        reader = csv.DictReader(csv_file, fieldnames=headers)
        
        for row in reader:
            if not row:
                continue
                
            # Parse network identifiers (fallbacks if not exactly matching CICIDS2017)
            src_ip = row.get("Source IP", row.get("src_ip", "0.0.0.0")).strip()
            dest_ip = row.get("Destination IP", row.get("dest_ip", "0.0.0.0")).strip()
            
            # Map standard ports
            try:
                src_port = int(row.get("Source Port", row.get("source_port", 0)))
                dest_port = int(row.get("Destination Port", row.get("dest_port", 0)))
            except ValueError:
                src_port, dest_port = 0, 0
                
            protocol_str = row.get("Protocol", "TCP").strip()
            
            # Label from dataset (for evaluation)
            label = row.get("Label", "BENIGN").strip()
            
            # Build features dictionary for model prediction
            features = {}
            for key, val in row.items():
                if key and val:
                    try:
                        features[key.strip()] = float(val)
                    except ValueError:
                        features[key.strip()] = val
            
            # Run ML Inference
            pred_result = predictor.predict(features)
            
            # Save flow record
            log_entry = LogEntry(
                upload_id=upload_id,
                source_ip=src_ip,
                dest_ip=dest_ip,
                source_port=src_port,
                dest_port=dest_port,
                protocol=protocol_str,
                flow_duration=float(row.get("Flow Duration", 0)),
                total_fwd_packets=int(row.get("Total Fwd Packets", 0)),
                total_bwd_packets=int(row.get("Total Backward Packets", 0)),
                label=label,
                prediction=pred_result["label"],
                confidence=pred_result["confidence"]
            )
            db.add(log_entry)
            
            # If model flags anomaly, create an alert
            if pred_result["is_anomaly"]:
                anomalies_detected += 1
                
                # Determine severity based on attack confidence and type
                severity = "medium"
                if pred_result["label"] in ["DDoS", "Infiltration", "Heartbleed"]:
                    severity = "critical" if pred_result["confidence"] > 0.8 else "high"
                elif pred_result["label"] in ["Web Attack", "Brute Force"]:
                    severity = "high"
                elif pred_result["label"] == "PortScan":
                    severity = "medium"
                    
                alert = Alert(
                    source_ip=src_ip,
                    dest_ip=dest_ip,
                    source_port=src_port,
                    dest_port=dest_port,
                    protocol=protocol_str,
                    attack_type=pred_result["label"],
                    severity=severity,
                    confidence=pred_result["confidence"],
                    status="open",
                    raw_features=features
                )
                db.add(alert)
                await db.flush() # Populate alert ID
                alerts_created.append(alert.id)
                
            total_processed += 1
            if total_processed >= 1000: # Limit processing size for memory/demo constraints
                break
                
        await db.commit()
        
        return LogUploadResponse(
            upload_id=upload_id,
            total_processed=total_processed,
            anomalies_detected=anomalies_detected,
            alerts_created=alerts_created,
            status="completed"
        )
