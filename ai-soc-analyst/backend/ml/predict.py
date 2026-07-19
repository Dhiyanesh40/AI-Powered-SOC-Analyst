"""
Prediction service for uploaded CSV datasets.

Responsibilities:
- Load the uploaded CSV
- Apply the same preprocessing pipeline used during training
- Generate predictions and confidence scores
- Map confidences to severity levels
- Build a SOC analysis summary
"""

import logging
import time
from pathlib import Path
from collections import Counter
from typing import Optional

import numpy as np
import pandas as pd

from ml.model_loader import ModelLoader
from ml.preprocessing import preprocess_for_inference

logger = logging.getLogger(__name__)


def map_confidence_to_severity(confidence: float) -> str:
    """Map a prediction confidence score to a SOC severity level."""
    if confidence >= 0.90:
        return "Critical"
    elif confidence >= 0.75:
        return "High"
    elif confidence >= 0.50:
        return "Medium"
    else:
        return "Low"


def predict_dataset(filepath: str) -> dict:
    """
    Run the ML model on an uploaded CSV file.

    Args:
        filepath: Path to the uploaded CSV file.

    Returns:
        Dictionary containing the SOC analysis summary:
            - total_records
            - attack_distribution
            - most_common_attack
            - average_confidence
            - highest_confidence
            - threat_level
            - analysis_duration
            - predictions (list of per-row dicts with label and confidence)
    """
    loader = ModelLoader.get_instance()

    if not loader.is_loaded:
        if not loader.load():
            raise RuntimeError(
                "ML model is not available. Train the model first using: "
                "python -m ml.train --data <path_to_csv>"
            )

    model = loader.get_model()
    encoder = loader.get_encoder()
    class_names = list(encoder.classes_)

    start_time = time.time()

    # ── Load and preprocess ──
    logger.info("Loading dataset for prediction: %s", filepath)
    df = pd.read_csv(filepath, low_memory=False)
    raw_count = len(df)
    logger.info("Raw records: %d", raw_count)

    X, _ = preprocess_for_inference(df, encoder)
    processed_count = len(X)
    logger.info("Records after preprocessing: %d", processed_count)

    # ── Predict ──
    logger.info("Running predictions...")
    probabilities = model.predict_proba(X)

    # Handle binary classifiers that may return (n,1) or (n,) shaped output
    probabilities = np.asarray(probabilities)
    if probabilities.ndim == 1:
        # Binary model returning raw probabilities for the positive class
        probabilities = np.column_stack([1 - probabilities, probabilities])
    elif probabilities.shape[1] == 1:
        probabilities = np.column_stack([1 - probabilities, probabilities])

    predicted_indices = np.argmax(probabilities, axis=1)
    confidences = np.max(probabilities, axis=1)
    predicted_labels = encoder.inverse_transform(predicted_indices)

    # ── Build attack distribution ──
    label_counts = Counter(predicted_labels)
    attack_distribution = dict(label_counts.most_common())

    # Identify threats (anything that is not BENIGN)
    benign_key = None
    for cls in class_names:
        if cls.upper() == "BENIGN":
            benign_key = cls
            break

    threats_detected = sum(
        count for label, count in attack_distribution.items()
        if label != benign_key
    )

    most_common_attack = "None"
    if benign_key:
        non_benign = {k: v for k, v in attack_distribution.items() if k != benign_key}
        if non_benign:
            most_common_attack = max(non_benign, key=non_benign.get)
    else:
        if attack_distribution:
            most_common_attack = max(attack_distribution, key=attack_distribution.get)

    avg_confidence = float(np.mean(confidences))
    max_confidence = float(np.max(confidences))

    # Overall threat level based on proportion of threats
    threat_ratio = threats_detected / max(processed_count, 1)
    if threat_ratio > 0.50:
        threat_level = "Critical"
    elif threat_ratio > 0.25:
        threat_level = "High"
    elif threat_ratio > 0.05:
        threat_level = "Medium"
    else:
        threat_level = "Low"

    analysis_duration = round(time.time() - start_time, 2)

    summary = {
        "total_records": processed_count,
        "attack_distribution": attack_distribution,
        "most_common_attack": most_common_attack,
        "average_confidence": round(avg_confidence, 4),
        "highest_confidence": round(max_confidence, 4),
        "threat_level": threat_level,
        "threats_detected": threats_detected,
        "analysis_duration": analysis_duration,
    }

    logger.info("Analysis complete in %.2fs — %d threats detected, threat level: %s",
                analysis_duration, threats_detected, threat_level)

    return summary
