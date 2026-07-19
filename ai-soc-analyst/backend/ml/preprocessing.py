"""
Preprocessing pipeline for CICIDS2017 dataset.

Handles:
- Loading CSV data
- Cleaning column names
- Removing duplicates
- Handling missing / infinite values
- Feature selection
- Label encoding
- Train/test splitting

This module is reusable for BOTH training and inference.
"""

import logging
from typing import Tuple, Optional

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

logger = logging.getLogger(__name__)

# ── CICIDS2017 selected numeric features ──
# These are the most discriminative features for network intrusion detection.
SELECTED_FEATURES = [
    "Destination Port",
    "Flow Duration",
    "Total Fwd Packets",
    "Total Backward Packets",
    "Total Length of Fwd Packets",
    "Total Length of Bwd Packets",
    "Fwd Packet Length Max",
    "Fwd Packet Length Min",
    "Fwd Packet Length Mean",
    "Fwd Packet Length Std",
    "Bwd Packet Length Max",
    "Bwd Packet Length Min",
    "Bwd Packet Length Mean",
    "Bwd Packet Length Std",
    "Flow Bytes/s",
    "Flow Packets/s",
    "Flow IAT Mean",
    "Flow IAT Std",
    "Flow IAT Max",
    "Flow IAT Min",
    "Fwd IAT Total",
    "Fwd IAT Mean",
    "Fwd IAT Std",
    "Fwd IAT Max",
    "Fwd IAT Min",
    "Bwd IAT Total",
    "Bwd IAT Mean",
    "Bwd IAT Std",
    "Bwd IAT Max",
    "Bwd IAT Min",
    "Fwd PSH Flags",
    "Fwd URG Flags",
    "Fwd Header Length",
    "Bwd Header Length",
    "Fwd Packets/s",
    "Bwd Packets/s",
    "Min Packet Length",
    "Max Packet Length",
    "Packet Length Mean",
    "Packet Length Std",
    "Packet Length Variance",
    "FIN Flag Count",
    "SYN Flag Count",
    "RST Flag Count",
    "PSH Flag Count",
    "ACK Flag Count",
    "URG Flag Count",
    "Down/Up Ratio",
    "Average Packet Size",
    "Avg Fwd Segment Size",
    "Avg Bwd Segment Size",
    "Init_Win_bytes_forward",
    "Init_Win_bytes_backward",
    "act_data_pkt_fwd",
    "min_seg_size_forward",
    "Active Mean",
    "Active Std",
    "Active Max",
    "Active Min",
    "Idle Mean",
    "Idle Std",
    "Idle Max",
    "Idle Min",
]

LABEL_COLUMN = "Label"


def clean_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """Strip leading/trailing whitespace from all column names."""
    df.columns = df.columns.str.strip()
    return df


def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """Remove duplicate rows."""
    before = len(df)
    df = df.drop_duplicates()
    after = len(df)
    logger.info("Removed %d duplicate rows (%d -> %d).", before - after, before, after)
    return df


def handle_missing_and_infinite(df: pd.DataFrame) -> pd.DataFrame:
    """Replace infinite values with NaN, then drop rows with any NaN."""
    df = df.replace([np.inf, -np.inf], np.nan)
    before = len(df)
    df = df.dropna()
    after = len(df)
    logger.info("Dropped %d rows with missing/infinite values.", before - after)
    return df


def select_features(df: pd.DataFrame, include_label: bool = True) -> pd.DataFrame:
    """
    Select only the features used by the model.

    If `include_label` is True (training mode), also keep the Label column.
    If False (inference mode), drop Label if present.
    """
    available = [f for f in SELECTED_FEATURES if f in df.columns]
    missing = [f for f in SELECTED_FEATURES if f not in df.columns]

    if missing:
        logger.warning("Missing features (will be zero-filled): %s", missing)

    cols = available.copy()
    if include_label and LABEL_COLUMN in df.columns:
        cols.append(LABEL_COLUMN)

    df_selected = df[cols].copy()

    # Zero-fill missing features so the model always gets the same shape
    for feat in missing:
        df_selected[feat] = 0.0

    # Reorder to match SELECTED_FEATURES exactly
    if include_label and LABEL_COLUMN in df_selected.columns:
        df_selected = df_selected[SELECTED_FEATURES + [LABEL_COLUMN]]
    else:
        df_selected = df_selected[SELECTED_FEATURES]

    return df_selected


def encode_labels(
    labels: pd.Series,
    encoder: Optional[LabelEncoder] = None,
) -> Tuple[np.ndarray, LabelEncoder]:
    """
    Encode string labels to integers.

    If an encoder is provided, uses it (inference mode).
    Otherwise, fits a new one (training mode).
    """
    if encoder is None:
        encoder = LabelEncoder()
        encoded = encoder.fit_transform(labels)
        logger.info("Label classes: %s", list(encoder.classes_))
    else:
        encoded = encoder.transform(labels)
    return encoded, encoder


def preprocess_for_training(
    filepath: str,
    test_size: float = 0.2,
    random_state: int = 42,
) -> dict:
    """
    Full preprocessing pipeline for training.

    Returns a dict with:
        X_train, X_test, y_train, y_test, label_encoder, feature_names
    """
    logger.info("Loading dataset from: %s", filepath)
    df = pd.read_csv(filepath, low_memory=False)
    logger.info("Raw dataset shape: %s", df.shape)

    df = clean_column_names(df)
    df = remove_duplicates(df)
    df = handle_missing_and_infinite(df)
    df = select_features(df, include_label=True)

    # Separate features and labels
    X = df[SELECTED_FEATURES].values.astype(np.float64)
    y_raw = df[LABEL_COLUMN]

    y, label_encoder = encode_labels(y_raw)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y,
    )

    logger.info("Train size: %d | Test size: %d", len(X_train), len(X_test))

    return {
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
        "label_encoder": label_encoder,
        "feature_names": SELECTED_FEATURES,
    }


def preprocess_for_inference(
    df: pd.DataFrame,
    label_encoder: LabelEncoder,
) -> Tuple[np.ndarray, Optional[np.ndarray]]:
    """
    Preprocess a user-uploaded CSV for prediction.

    Returns:
        X: numpy array ready for model.predict()
        y_true: encoded true labels if Label column exists, else None
    """
    df = clean_column_names(df)
    has_labels = LABEL_COLUMN in df.columns

    df = handle_missing_and_infinite(df)
    df = select_features(df, include_label=has_labels)

    X = df[SELECTED_FEATURES].values.astype(np.float64)

    y_true = None
    if has_labels:
        try:
            y_true, _ = encode_labels(df[LABEL_COLUMN], encoder=label_encoder)
        except ValueError:
            logger.warning("Some labels are unseen by the encoder; ignoring true labels.")
            y_true = None

    return X, y_true
