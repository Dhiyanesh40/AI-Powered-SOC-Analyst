import sqlite3
import json

conn = sqlite3.connect('soc_analyst.db')
cursor = conn.cursor()

tables = ['security_logs', 'analysis_results', 'generated_reports', 'ml_models']
result = {}

for table in tables:
    table_info = {}
    cursor.execute(f"PRAGMA table_info({table})")
    schema = cursor.fetchall()
    table_info["schema"] = {col[1]: col[2] for col in schema}
    
    cursor.execute(f"SELECT COUNT(*) FROM {table}")
    count = cursor.fetchone()[0]
    table_info["row_count"] = count
    
    if count > 0:
        cursor.execute(f"SELECT * FROM {table} LIMIT 1")
        row = cursor.fetchone()
        columns = [col[0] for col in cursor.description]
        table_info["sample_row"] = dict(zip(columns, row))
    
    result[table] = table_info

print(json.dumps(result, indent=2))
