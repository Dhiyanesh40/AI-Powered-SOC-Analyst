# CICIDS2017 Intrusion Detection ML Pipeline

This sub-module contains the complete pipeline for preprocessing, feature engineering, training, evaluating, and loading the machine learning models.

## Preprocessing & Data Cleaning
- **Encoding Issues:** The pipeline parses raw CSV files using `utf-8` and automatically falls back to `latin-1` to handle the dirty bytes sometimes found in the CICIDS2017 raw captures.
- **Column Name Standardization:** Strips leading/trailing spaces from column headers (e.g., `' Destination Port'` becomes `'Destination Port'`).
- **Missing / Infinite Values:** Replaces all occurrences of `Infinity` or `-Infinity` (caused by divide-by-zero errors in flow duration calculation in the original PCAP export) with NaN, and drops rows containing nulls.
- **Labels Mapping:** Group minor attack subsets into a structured 10-class integer mapping (BENIGN, DDoS, PortScan, Bot, Infiltration, Web Attack, Brute Force, Heartbleed, FTP-Patator, SSH-Patator).

## Feature Selection
We extract **25 highly discriminative flow features** verified by academic literature (e.g., *Scientific Reports 2026*) to maintain high model performance while reducing feature space dimensionality:
- Flow Duration, Total Fwd/Bwd Packets, Flow Bytes/s, Flow Packets/s
- Fwd/Bwd Packet Length Stats (Mean, Max, Std)
- Inter-Arrival Time (IAT) statistics
- Protocol TCP Flags (PSH, SYN, RST, ACK Counts)
- TCP Window sizes (`Init_Win_bytes_forward`, `Init_Win_bytes_backward`)

Standard scaling (`StandardScaler`) is applied to normalize values across columns of differing orders of magnitude.

## Rationale for Choosing XGBoost
We evaluate both an **XGBoost Classifier** and a **Random Forest Classifier** (baseline). In real-world intrusion detection systems, **XGBoost** is selected as the primary algorithm for the following reasons:
1. **Handling Class Imbalance:** Tabular cybersecurity datasets are extremely imbalanced (typically 99% BENIGN traffic). XGBoost handles this well using scale-based weight balancing and gradients, alongside SMOTE.
2. **Speed of Inference:** During runtime, network packets must be evaluated in milliseconds. XGBoost trees can be compiled into highly optimized representation, yielding extremely low latency predictions compared to heavy deep neural networks.
3. **Resilience to Tabular Noise:** Tree-based models handle mixed feature types (continuous packet counts alongside binary flags) without requiring complex neural architecture configurations.
4. **Built-in Feature Importance:** Helps SOC analysts audit *why* a specific decision was flagged by showing which telemetry metrics influenced the decision.

## Pipeline Usage

### 1. Preprocess Raw Data
```bash
python ml/pipeline/preprocess.py path/to/raw_cicids2017.csv ml/data/processed/
```

### 2. Train Models
Run the training pipeline (generates standard scalers and models):
```python
from ml.pipeline.train import train_pipeline
train_pipeline("ml/data/processed/clean_dataset_processed.csv", "ml/models/")
```

### 3. Evaluate Models
```bash
python ml/pipeline/evaluate.py ml/models/
```
Output metrics will be written in `ml/models/evaluation_metrics.json`.
