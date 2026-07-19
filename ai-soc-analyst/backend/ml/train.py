"""
Model training script for the XGBoost multiclass classifier.

Usage (run manually from backend/ directory):
    python -m ml.train --data <path_to_csv>

The FastAPI server NEVER calls this module automatically.
"""

import logging
import argparse
import time
from pathlib import Path
from datetime import datetime

import joblib
import numpy as np
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
)

from ml.preprocessing import preprocess_for_training

logger = logging.getLogger(__name__)

# ── Paths ──
MODEL_DIR = Path(__file__).parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

MODEL_PATH = MODEL_DIR / "xgboost_model.pkl"
ENCODER_PATH = MODEL_DIR / "label_encoder.pkl"
METADATA_PATH = MODEL_DIR / "model_metadata.pkl"


def train_model(data_path: str, save_metrics_to_db: bool = True) -> dict:
    """
    Train an XGBoost model on the CICIDS2017 dataset.

    Args:
        data_path: Path to the CSV dataset.
        save_metrics_to_db: Whether to save evaluation metrics to the MLModel table.

    Returns:
        Dictionary containing evaluation metrics.
    """
    logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")

    logger.info("=" * 60)
    logger.info("Starting model training...")
    logger.info("=" * 60)

    start_time = time.time()

    # ── Step 1: Preprocess ──
    data = preprocess_for_training(data_path)
    X_train = data["X_train"]
    X_test = data["X_test"]
    y_train = data["y_train"]
    y_test = data["y_test"]
    label_encoder = data["label_encoder"]

    n_classes = len(label_encoder.classes_)
    logger.info("Number of classes: %d", n_classes)

    # ── Step 2: Train XGBoost ──
    is_binary = n_classes == 2
    logger.info("Classification mode: %s", "binary" if is_binary else "multiclass")

    if is_binary:
        model = XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            objective="binary:logistic",
            eval_metric="logloss",
            use_label_encoder=False,
            n_jobs=-1,
            random_state=42,
            verbosity=1,
        )
    else:
        model = XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            objective="multi:softprob",
            num_class=n_classes,
            eval_metric="mlogloss",
            use_label_encoder=False,
            n_jobs=-1,
            random_state=42,
            verbosity=1,
        )

    model.fit(
        X_train,
        y_train,
        eval_set=[(X_test, y_test)],
        verbose=True,
    )

    # ── Step 3: Evaluate ──
    logger.info("Evaluating model...")
    y_pred = model.predict(X_test)

    # Ensure y_pred is always a 1D array of integer class labels
    y_pred = np.asarray(y_pred)
    if y_pred.ndim > 1:
        y_pred = np.argmax(y_pred, axis=1)
    else:
        y_pred = y_pred.astype(int)

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    rec = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    logger.info("Accuracy:  %.4f", acc)
    logger.info("Precision: %.4f", prec)
    logger.info("Recall:    %.4f", rec)
    logger.info("F1 Score:  %.4f", f1)

    report = classification_report(
        y_test, y_pred,
        target_names=label_encoder.classes_,
        zero_division=0,
    )
    logger.info("Classification Report:\n%s", report)

    training_duration = time.time() - start_time
    logger.info("Training completed in %.2f seconds.", training_duration)

    # ── Step 4: Save model artifacts ──
    joblib.dump(model, MODEL_PATH)
    logger.info("Model saved to: %s", MODEL_PATH)

    joblib.dump(label_encoder, ENCODER_PATH)
    logger.info("Label encoder saved to: %s", ENCODER_PATH)

    metadata = {
        "model_name": "SOC_XGBoost_v1",
        "algorithm": "XGBoost",
        "accuracy": float(acc),
        "precision": float(prec),
        "recall": float(rec),
        "f1_score": float(f1),
        "n_classes": n_classes,
        "classes": list(label_encoder.classes_),
        "feature_names": data["feature_names"],
        "trained_on": datetime.utcnow().isoformat(),
        "model_version": "1.0.0",
        "training_duration_seconds": round(training_duration, 2),
    }
    joblib.dump(metadata, METADATA_PATH)
    logger.info("Metadata saved to: %s", METADATA_PATH)

    # ── Step 5: Optionally save metrics to the DB ──
    if save_metrics_to_db:
        try:
            _save_metrics_to_db(metadata)
            logger.info("Metrics saved to MLModel table.")
        except Exception as e:
            logger.error("Failed to save metrics to DB: %s", e)

    return metadata


def _save_metrics_to_db(metadata: dict) -> None:
    """Save training metrics into the MLModel database table."""
    from db.session import SessionLocal
    from models.ml_model import MLModel

    db = SessionLocal()
    try:
        record = MLModel(
            model_name=metadata["model_name"],
            algorithm=metadata["algorithm"],
            accuracy=metadata["accuracy"],
            precision=metadata["precision"],
            recall=metadata["recall"],
            f1_score=metadata["f1_score"],
            model_version=metadata["model_version"],
        )
        db.add(record)
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train the SOC XGBoost model.")
    parser.add_argument(
        "--data",
        type=str,
        required=True,
        help="Path to the CICIDS2017 CSV file.",
    )
    parser.add_argument(
        "--no-db",
        action="store_true",
        help="Skip saving metrics to the database.",
    )
    args = parser.parse_args()

    train_model(args.data, save_metrics_to_db=not args.no_db)
