import pandas as pd
import numpy as np
import logging
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from typing import Tuple, List
from ml.pipeline.config import FEATURE_COLUMNS

logger = logging.getLogger(__name__)

def extract_features(
    processed_csv_path: str
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, StandardScaler, List[str]]:
    """
    Extract required feature columns, apply standard scaling, 
    and split into stratified train/test partitions (80/20).
    """
    logger.info(f"Loading features from {processed_csv_path}...")
    df = pd.read_csv(processed_csv_path)
    
    # Check if necessary columns exist
    missing_cols = [col for col in FEATURE_COLUMNS if col not in df.columns]
    if missing_cols:
        logger.error(f"Missing required columns in dataset: {missing_cols}")
        raise KeyError(f"Missing required columns in dataset: {missing_cols}")
        
    X = df[FEATURE_COLUMNS].values
    y = df["Label_Encoded"].values
    
    # 80/20 Stratified Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, 
        test_size=0.20, 
        stratify=y, 
        random_state=42
    )
    logger.info(f"Split data into train shape {X_train.shape} and test shape {X_test.shape}")
    
    # Fit StandardScaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, FEATURE_COLUMNS
