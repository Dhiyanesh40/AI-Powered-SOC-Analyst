import os
import joblib
import pandas as pd
import numpy as np
import logging
from typing import Dict, Any, List, Tuple
from ml.pipeline.config import FEATURE_COLUMNS, LABEL_MAP

logger = logging.getLogger(__name__)

class IDSPredictor:
    def __init__(self, model_path: str, scaler_path: str):
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.model = None
        self.scaler = None
        self.is_loaded = False
        self.load_model()
        
    def load_model(self) -> None:
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                self.is_loaded = True
                logger.info(f"ML Model loaded successfully from {self.model_path}")
            else:
                logger.warning(
                    f"Model file or Scaler file not found. "
                    f"Predictor will run in Simulation Mode. "
                    f"Expected paths: {self.model_path}, {self.scaler_path}"
                )
        except Exception as e:
            logger.error(f"Error loading ML model: {e}. Falling back to simulation.")
            self.is_loaded = False
            
    def predict(self, features_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict whether a single flow record is BENIGN or an attack.
        """
        if not self.is_loaded:
            # Simulation Mode for out-of-box operation
            # Simulate a small percentage of attacks based on Port or packets
            dest_port = features_dict.get("Destination Port", features_dict.get("dest_port", 80))
            flow_duration = features_dict.get("Flow Duration", 0)
            
            if dest_port == 22 or dest_port == 21:
                # SSH/FTP Brute force simulation
                if flow_duration > 5000000:
                    return {"label": "SSH-Patator", "confidence": 0.88, "is_anomaly": True}
            elif dest_port == 80 and flow_duration > 10000000:
                # DDoS simulation
                return {"label": "DDoS", "confidence": 0.94, "is_anomaly": True}
            elif features_dict.get("Total Fwd Packets", 0) > 100 and features_dict.get("SYN Flag Count", 0) > 50:
                # PortScan simulation
                return {"label": "PortScan", "confidence": 0.97, "is_anomaly": True}
                
            return {"label": "BENIGN", "confidence": 0.99, "is_anomaly": False}
            
        try:
            # Map dictionary to features array in exact order
            features = [float(features_dict.get(col, 0.0)) for col in FEATURE_COLUMNS]
            df = pd.DataFrame([features], columns=FEATURE_COLUMNS)
            
            # Scale features
            scaled_features = self.scaler.transform(df)
            
            # Predict
            pred_class = self.model.predict(scaled_features)[0]
            pred_proba = self.model.predict_proba(scaled_features)[0]
            
            confidence = float(pred_proba[pred_class])
            label_name = LABEL_MAP.get(int(pred_class), "BENIGN")
            
            return {
                "label": label_name,
                "confidence": confidence,
                "is_anomaly": label_name != "BENIGN"
            }
        except Exception as e:
            logger.error(f"Error during ML inference: {e}")
            return {"label": "ERROR", "confidence": 0.0, "is_anomaly": False}

    def predict_batch(self, df_flows: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Predict a batch of flow records from a pandas DataFrame.
        """
        results = []
        for _, row in df_flows.iterrows():
            features_dict = row.to_dict()
            results.append(self.predict(features_dict))
        return results
