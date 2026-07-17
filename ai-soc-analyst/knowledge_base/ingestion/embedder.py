from langchain_community.embeddings import HuggingFaceEmbeddings
import logging

logger = logging.getLogger(__name__)

def get_embedding_model() -> HuggingFaceEmbeddings:
    """
    Get the embedding model.
    
    RATIONALE FOR EMBEDDING MODEL ('all-MiniLM-L6-v2'):
    1. Low Dimensionality (384 dimensions): Yields compact vector spaces, speeding up vector searches.
    2. Zero-Shot Capability: Highly pre-trained on multi-sentence datasets, rendering excellent semantic matches
       for cyber threat concepts, IP configurations, and technical playbooks.
    3. Resource Efficiency: Extremely fast execution on standard CPU environments, preventing latency spikes
       during agent retrieval queries.
    """
    logger.info("Initializing HuggingFace Embedding model: all-MiniLM-L6-v2")
    try:
        model_kwargs = {'device': 'cpu'} # Change to 'cuda' if GPU is available
        encode_kwargs = {'normalize_embeddings': True} # Cosine similarity optimization
        
        return HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2",
            model_kwargs=model_kwargs,
            encode_kwargs=encode_kwargs
        )
    except Exception as e:
        logger.error(f"Error loading embedding model: {e}")
        raise e
