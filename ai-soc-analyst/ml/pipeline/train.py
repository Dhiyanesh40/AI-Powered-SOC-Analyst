import time
import joblib
import logging
from pathlib import Path
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier
from ml.pipeline.features import extract_features

# Fallback in case imblearn is not installed or has issues
try:
    from imblearn.over_sampling import SMOTE
    SMOTE_AVAILABLE = True
except ImportError:
    SMOTE_AVAILABLE = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def train_pipeline(processed_csv_path: str, model_save_dir: str):
    """
    Train an XGBoost Classifier and a Random Forest Classifier.
    Applies SMOTE to manage class imbalances, evaluates training time, 
    and serializes models and scalers.
    
    WHY XGBOOST FOR CYBERSECURITY TABULAR DATA:
    1. Fast Inference: Speed is crucial in real-time intrusion detection. XGBoost has efficient tree evaluation algorithms.
    2. Missing / Imbalanced Data: It contains built-in strategies to handle highly skewed class distributions.
    3. Regularization: L1 & L2 regularization prevent overfitting on specific IP ranges or signatures.
    4. Custom Objectives & High Accuracy: Consistently outperforms neural nets and SVMs on security telemetry tables.
    """
    save_path = Path(model_save_dir)
    save_path.mkdir(parents=True, exist_ok=True)
    
    # 1. Extract and scale features
    X_train, X_test, y_train, y_test, scaler, _ = extract_features(processed_csv_path)
    
    # Save the scaler immediately
    scaler_path = save_path / "scaler_v1.joblib"
    joblib.dump(scaler, scaler_path)
    logger.info(f"Scaler saved to {scaler_path}")
    
    # 2. Resample minority classes using SMOTE if available
    if SMOTE_AVAILABLE:
        logger.info("Applying SMOTE to balance classes in training partition...")
        # Reduce k_neighbors if some classes have extremely few samples (e.g. Heartbleed)
        # Use a safe value for neighbor sizes
        min_class_size = min(list(dict(zip(*np.unique(y_train, return_counts=True))).values()))
        k_neighbors = min(5, max(1, min_class_size - 1))
        
        if k_neighbors > 0:
            smote = SMOTE(k_neighbors=k_neighbors, random_state=42)
            X_train, y_train = smote.fit_resample(X_train, y_train)
            logger.info(f"Balanced training set shape: {X_train.shape}")
        else:
            logger.warning("Minority class size is too small even for SMOTE. Training directly on original split.")
    else:
        logger.warning("SMOTE is not available. Training directly on original split.")
        
    # 3. Train XGBoost
    logger.info("Training XGBoost Classifier...")
    xgb_model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric='mlogloss',
        random_state=42
    )
    
    start_time = time.time()
    xgb_model.fit(X_train, y_train)
    xgb_duration = time.time() - start_time
    logger.info(f"XGBoost training completed in {xgb_duration:.2f} seconds.")
    
    xgb_model_path = save_path / "xgboost_ids_v1.joblib"
    joblib.dump(xgb_model, xgb_model_path)
    logger.info(f"XGBoost model saved to {xgb_model_path}")
    
    # 4. Train Random Forest (Baseline)
    logger.info("Training Random Forest Baseline Classifier...")
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        random_state=42,
        n_jobs=-1
    )
    
    start_time = time.time()
    rf_model.fit(X_train, y_train)
    rf_duration = time.time() - start_time
    logger.info(f"Random Forest training completed in {rf_duration:.2f} seconds.")
    
    rf_model_path = save_path / "random_forest_ids_v1.joblib"
    joblib.dump(rf_model, rf_model_path)
    logger.info(f"Random Forest model saved to {rf_model_path}")
    
    # Save the test set variables for evaluation script
    test_data_path = save_path / "test_data.joblib"
    joblib.dump((X_test, y_test), test_data_path)
    logger.info(f"Test data cached to {test_data_path} for evaluation.")
    
    return str(xgb_model_path), str(scaler_path)
