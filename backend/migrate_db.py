import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "rewise.db")
con = sqlite3.connect(db_path)
cur = con.cursor()

# Check transactions table
cur.execute("PRAGMA table_info(transactions)")
cols = [r[1] for r in cur.fetchall()]

tx_cols = [
    ("partner_id", "INTEGER"),
    ("proof_url", "VARCHAR(300)"),
    ("proof_notes", "VARCHAR(300)"),
]

for col, ctype in tx_cols:
    if col not in cols:
        cur.execute(f"ALTER TABLE transactions ADD COLUMN {col} {ctype}")
        print(f"Added column {col} to transactions")

con.commit()
con.close()
print("Transactions migration complete!")
