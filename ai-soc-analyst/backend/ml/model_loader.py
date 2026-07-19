"""
Model loader — Singleton pattern for keeping the trained model in memory.

Loaded once when the FastAPI server starts or on first prediction request.
"""

import logging
from pathlib import Path
from typing import Optional

import joblib
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent / "models"
MODEL_PATH = MODEL_DIR / "xgboost_model.pkl"
ENCODER_PATH = MODEL_DIR / "label_encoder.pkl"
METADATA_PATH = MODEL_DIR / "model_metadata.pkl"


class ModelLoader:
    """
    Singleton that holds the trained model, label encoder, and metadata in memory.
    """

    _instance: Optional["ModelLoader"] = None

    def __init__(self):
        self.model: Optional[XGBClassifier] = None
        self.label_encoder: Optional[LabelEncoder] = None
        self.metadata: Optional[dict] = None
        self._loaded = False

    @classmethod
    def get_instance(cls) -> "ModelLoader":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def load(self) -> bool:
        """
        Load model artifacts from disk.

        Returns True if successful, False if model files are missing.
        """
        if self._loaded:
            return True

        if not MODEL_PATH.exists():
            logger.warning("Model file not found at %s. Train the model first.", MODEL_PATH)
            return False

        if not ENCODER_PATH.exists():
            logger.warning("Label encoder not found at %s.", ENCODER_PATH)
            return False

        try:
            self.model = joblib.load(MODEL_PATH)
            self.label_encoder = joblib.load(ENCODER_PATH)

            if METADATA_PATH.exists():
                self.metadata = joblib.load(METADATA_PATH)

            self._loaded = True
            logger.info("Model loaded successfully. Version: %s",
                        self.metadata.get("model_version", "unknown") if self.metadata else "unknown")
            return True

        except Exception as e:
            logger.error("Failed to load model: %s", e)
            self._loaded = False
            return False

    def get_model(self) -> XGBClassifier:
        if not self._loaded:
            raise RuntimeError("Model is not loaded. Call load() first or train the model.")
        return self.model

    def get_encoder(self) -> LabelEncoder:
        if not self._loaded:
            raise RuntimeError("Model is not loaded. Call load() first or train the model.")
        return self.label_encoder

    def get_metadata(self) -> dict:
        if not self._loaded:
            raise RuntimeError("Model is not loaded. Call load() first or train the model.")
        return self.metadata or {}
