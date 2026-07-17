# Feature columns as extracted from CICIDS2017 dataset for ML inference
FEATURE_COLUMNS = [
    "Flow Duration",
    "Total Fwd Packets",
    "Total Backward Packets",
    "Flow Bytes/s",
    "Flow Packets/s",
    "Fwd Packet Length Mean",
    "Fwd Packet Length Max",
    "Fwd Packet Length Std",
    "Bwd Packet Length Mean",
    "Bwd Packet Length Max",
    "Bwd Packet Length Std",
    "Flow IAT Mean",
    "Flow IAT Std",
    "Fwd IAT Mean",
    "Bwd IAT Mean",
    "Fwd PSH Flags",
    "SYN Flag Count",
    "RST Flag Count",
    "ACK Flag Count",
    "Average Packet Size",
    "Init_Win_bytes_forward",
    "Init_Win_bytes_backward",
    "Subflow Fwd Bytes",
    "Subflow Bwd Bytes",
    "min_seg_size_forward"
]

LABEL_MAP = {
    0: "BENIGN",
    1: "DDoS",
    2: "PortScan",
    3: "Bot",
    4: "Infiltration",
    5: "Web Attack",
    6: "Brute Force",
    7: "Heartbleed",
    8: "FTP-Patator",
    9: "SSH-Patator"
}

INV_LABEL_MAP = {v: k for k, v in LABEL_MAP.items()}
