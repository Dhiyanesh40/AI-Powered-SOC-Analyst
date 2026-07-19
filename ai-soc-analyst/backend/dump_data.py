import sqlite3
import csv
import sys

conn = sqlite3.connect('soc_analyst.db')
cursor = conn.cursor()

tables = ['security_logs', 'analysis_results', 'generated_reports', 'ml_models']

for table in tables:
    print(f'\n### {table}\n')
    cursor.execute(f"SELECT * FROM {table}")
    rows = cursor.fetchall()
    
    if not rows:
        print('*(Empty)*')
        continue
        
    columns = [col[0] for col in cursor.description]
    writer = csv.writer(sys.stdout, lineterminator='\n')
    writer.writerow(columns)
    writer.writerows(rows)
