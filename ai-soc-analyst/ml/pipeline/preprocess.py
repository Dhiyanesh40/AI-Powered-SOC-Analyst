import os
import pandas as pd
import numpy as np
import logging
from pathlib import Path
from ml.pipeline.config import INV_LABEL_MAP

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def preprocess_cicids2017(raw_csv_path: str, output_dir: str) -> str:
    """
    Load raw CICIDS2017 CSV file, strip headers, replace Inf/NaN values, 
    map label strings to model integers, drop duplicates, and save output.
    """
    logger.info(f"Starting preprocessing for {raw_csv_path}...")
    
    # 1. Read CSV (handles encoding and space strip on columns)
    try:
        # Some CICIDS2017 CSVs contain non-UTF8 characters, fall back to latin1 if utf-8 fails
        try:
            df = pd.read_csv(raw_csv_path, encoding="utf-8")
        except UnicodeDecodeError:
            df = pd.read_csv(raw_csv_path, encoding="latin1")
    except Exception as e:
        logger.error(f"Failed to read raw CSV file: {e}")
        raise e
        
    logger.info(f"Loaded CSV file. Shape: {df.shape}")
    
    # 2. Clean headers (strip leading/trailing whitespaces)
    df.columns = df.columns.str.strip()
    
    # 3. Handle Infinite and NaN values (highly prevalent in CICIDS2017 Flow Bytes/s)
    # Replace infinite values with NaN
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    
    # Drop rows with NaN values (usually very few) or impute
    nan_count = df.isna().sum().sum()
    if nan_count > 0:
        logger.info(f"Found {nan_count} NaN values. Dropping affected rows.")
        df.dropna(inplace=True)
        
    # 4. Remove Duplicates
    dup_count = df.duplicated().sum()
    if dup_count > 0:
        logger.info(f"Found {dup_count} duplicate rows. Dropping duplicates.")
        df.drop_duplicates(inplace=True)
        
    # 5. Map labels
    if "Label" in df.columns:
        # Standardize strings in Label
        df["Label"] = df["Label"].str.strip()
        
        # Map values using custom classification mapping
        # Group minor subclasses if needed, default map to integer keys
        def map_label(lbl):
            # Check for substrings to handle variants like 'Web Attack  Brute Force'
            for key_str, int_val in INV_LABEL_MAP.items():
                if key_str in lbl:
                    return int_val
            return 0 # Default to BENIGN
            
        df["Label_Encoded"] = df["Label"].apply(map_label)
        logger.info("Labels mapped successfully.")
        logger.info(f"Label distribution:\n{df['Label_Encoded'].value_counts()}")
    else:
        logger.warning("No 'Label' column found in dataset. Preprocessing will skip label mapping.")
        
    # Create output directory
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    
    # Save cleaned file
    filename = Path(raw_csv_path).stem + "_processed.csv"
    processed_file_path = out_path / filename
    df.to_csv(processed_file_path, index=False)
    
    logger.info(f"Preprocessing completed. Saved clean dataset to {processed_file_path}")
    return str(processed_file_path)

if __name__ == "__main__":
    # Test stub
    import sys
    if len(sys.argv) > 2:
        preprocess_cicids2017(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python preprocess.py <raw_csv_path> <output_dir>")
