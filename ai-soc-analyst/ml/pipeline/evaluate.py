import os
import json
import joblib
import logging
from pathlib import Path
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score
from ml.pipeline.config import LABEL_MAP

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def evaluate_models(model_dir: str):
    """
    Evaluate the saved XGBoost and Random Forest models on the cached test set.
    Generates classification reports, confusion matrices, and writes a metrics JSON.
    """
    path = Path(model_dir)
    test_data_path = path / "test_data.joblib"
    
    if not test_data_path.exists():
        logger.error(f"Test data not found at {test_data_path}. Run training first.")
        return
        
    X_test, y_test = joblib.load(test_data_path)
    
    # Load Models
    xgb_path = path / "xgboost_ids_v1.joblib"
    rf_path = path / "random_forest_ids_v1.joblib"
    
    evaluation_results = {}
    
    for name, model_path in [("XGBoost", xgb_path), ("Random Forest", rf_path)]:
        if not model_path.exists():
            logger.warning(f"Model file {model_path} not found. Skipping evaluation.")
            continue
            
        model = joblib.load(model_path)
        logger.info(f"Evaluating {name}...")
        
        preds = model.predict(X_test)
        
        acc = accuracy_score(y_test, preds)
        weighted_f1 = f1_score(y_test, preds, average="weighted")
        
        # Calculate reports
        report_dict = classification_report(
            y_test, preds, 
            target_names=[LABEL_MAP.get(i, "BENIGN") for i in sorted(list(set(y_test)))],
            output_dict=True
        )
        conf_mat = confusion_matrix(y_test, preds).tolist()
        
        evaluation_results[name] = {
            "accuracy": float(acc),
            "weighted_f1": float(weighted_f1),
            "classification_report": report_dict,
            "confusion_matrix": conf_mat
        }
        
        logger.info(f"{name} Evaluation Metrics:")
        logger.info(f"Accuracy: {acc:.4f} | Weighted F1: {weighted_f1:.4f}")
        
    # Write output metrics JSON
    metrics_json_path = path / "evaluation_metrics.json"
    with open(metrics_json_path, "w") as f:
        json.dump(evaluation_results, f, indent=4)
        
    logger.info(f"Evaluation report generated and saved to {metrics_json_path}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        evaluate_models(sys.argv[1])
    else:
        print("Usage: python evaluate.py <model_dir>")
