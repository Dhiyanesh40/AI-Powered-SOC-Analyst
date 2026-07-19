import sqlite3

db_path = "soc_analyst.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Drop old security_logs and let Base.metadata.create_all recreate it later, OR just create it now
cursor.execute("DROP TABLE IF EXISTS security_logs")

cursor.execute("""
CREATE TABLE security_logs (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    analysis_id INTEGER,
    dataset_filename VARCHAR(255) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(100) NOT NULL,
    current_stage VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    duration FLOAT,
    details TEXT
)
""")

# 2. Add columns to analysis_results
columns_to_add = [
    ("processing_time", "FLOAT"),
    ("average_confidence", "FLOAT"),
    ("attack_distribution", "TEXT"),
]

# Check existing columns
cursor.execute("PRAGMA table_info(analysis_results)")
existing_cols = [row[1] for row in cursor.fetchall()]

for col_name, col_type in columns_to_add:
    if col_name not in existing_cols:
        cursor.execute(f"ALTER TABLE analysis_results ADD COLUMN {col_name} {col_type}")

conn.commit()
conn.close()
print("Migration completed successfully.")
