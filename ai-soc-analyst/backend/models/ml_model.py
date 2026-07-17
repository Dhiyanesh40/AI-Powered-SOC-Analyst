from sqlalchemy import Column, Integer, String, Float, DateTime, func

from db.base import Base


class MLModel(Base):
    """
    Represents a trained Machine Learning model.
    Used for tracking model versions and evaluation metrics.
    """

    __tablename__ = "ml_models"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String(100), nullable=False)
    algorithm = Column(String(100), nullable=False)
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    trained_on = Column(DateTime, server_default=func.now())
    model_version = Column(String(50), nullable=False)
