"""
Module: ingest_ocds.py
Concrete Module Build Specification (Table 7):
Parse OCDS JSON releases; flatten into normalized relational tables:
tenders, bids, parties. Index CPV sector codes and create temporal partition keys in DuckDB.
"""

import os
import json
import duckdb

class OCDSIngestor:
    def __init__(self, db_path: str = ":memory:", read_only: bool = False):
        self.db_path = db_path
        self.read_only = read_only
        try:
            self.conn = duckdb.connect(db_path, read_only=read_only)
            if not read_only:
                self._init_schema()
        except Exception:
            # Fallback to read-only mode if locked by running server process
            self.conn = duckdb.connect(db_path, read_only=True)
            self.read_only = True

    def _init_schema(self):
        """Create normalized relational tables and indexes in DuckDB."""
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS tenders (
                id VARCHAR PRIMARY KEY,
                ocid VARCHAR,
                title VARCHAR,
                status VARCHAR,
                cpv_code VARCHAR,
                cpv_description VARCHAR,
                amount DOUBLE,
                budget DOUBLE,
                currency VARCHAR,
                start_date TIMESTAMP,
                end_date TIMESTAMP,
                duration_days INTEGER,
                bidder_count INTEGER,
                award_criteria VARCHAR,
                region VARCHAR,
                buyer_id VARCHAR,
                buyer_name VARCHAR,
                winning_vendor_id VARCHAR,
                winning_vendor_name VARCHAR,
                award_date TIMESTAMP,
                year_quarter VARCHAR
            );
        """)

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS bids (
                bid_id VARCHAR PRIMARY KEY,
                tender_id VARCHAR,
                vendor_id VARCHAR,
                vendor_name VARCHAR,
                amount DOUBLE,
                currency VARCHAR,
                status VARCHAR,
                submission_date TIMESTAMP,
                is_winner BOOLEAN
            );
        """)

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS parties (
                id VARCHAR PRIMARY KEY,
                name VARCHAR,
                tax_id VARCHAR,
                address VARCHAR,
                formation_date VARCHAR,
                director VARCHAR,
                phone VARCHAR,
                gps VARCHAR,
                role VARCHAR,
                cluster_id VARCHAR
            );
        """)

    def load_ocds_json(self, file_path: str):
        """Parse OCDS JSON releases and load into DuckDB tables."""
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        releases = data.get("releases", [])
        
        tender_rows = []
        bid_rows = []
        party_dict = {}

        for rel in releases:
            buyer = rel.get("buyer", {})
            tender = rel.get("tender", {})
            tender_id = tender.get("id")
            cpv = tender.get("classification", {})
            cpv_code = cpv.get("id", "UNKNOWN")
            cpv_desc = cpv.get("description", "")
            
            val = tender.get("value", {})
            amount = float(val.get("amount", 0.0))
            currency = val.get("currency", "USD")
            budget = float(tender.get("budget", {}).get("amount", amount))
            
            period = tender.get("tenderPeriod", {})
            start_d = period.get("startDate")
            end_d = period.get("endDate")
            duration_days = int(period.get("durationInDays", 14))
            num_bidders = int(tender.get("numberOfTenderers", 1))
            region = tender.get("region", buyer.get("region", "National"))

            # Buyer record
            buyer_id = buyer.get("id", "BUY-UNKNOWN")
            buyer_name = buyer.get("name", "Unknown Agency")
            if buyer_id not in party_dict:
                party_dict[buyer_id] = {
                    "id": buyer_id,
                    "name": buyer_name,
                    "tax_id": "GOV-" + buyer_id,
                    "address": f"Regional Office, {region}",
                    "formation_date": "1970-01-01",
                    "director": "Government Procurement Officer",
                    "phone": "+1-555-GOV-0000",
                    "gps": "38.9072,-77.0369",
                    "role": "buyer",
                    "cluster_id": buyer_id
                }

            # Awards to find winner
            awards = rel.get("awards", [])
            winning_vendor_id = None
            winning_vendor_name = None
            award_date = rel.get("date")
            if awards:
                suppliers = awards[0].get("suppliers", [])
                if suppliers:
                    winning_vendor_id = suppliers[0].get("id")
                    winning_vendor_name = suppliers[0].get("name")
                    if awards[0].get("date"):
                        award_date = awards[0].get("date")

            # Bids
            bids = rel.get("bids", {}).get("details", [])
            for b in bids:
                bid_id = b.get("id")
                tenderers = b.get("tenderers", [{}])
                v = tenderers[0]
                v_id = v.get("id")
                v_name = v.get("name")
                b_val = float(b.get("value", {}).get("amount", 0.0))
                b_curr = b.get("value", {}).get("currency", "USD")
                b_status = b.get("status", "valid")
                b_date = b.get("date", rel.get("date"))
                is_win = (v_id == winning_vendor_id)

                bid_rows.append((
                    bid_id, tender_id, v_id, v_name, b_val, b_curr, b_status, b_date, is_win
                ))

                if v_id and v_id not in party_dict:
                    party_dict[v_id] = {
                        "id": v_id,
                        "name": v_name,
                        "tax_id": v.get("tax_id", f"TAX-{v_id}"),
                        "address": v.get("address", "Corporate Headquarters"),
                        "formation_date": v.get("formation_date", "2015-01-01"),
                        "director": v.get("director", "Unknown Executive"),
                        "phone": v.get("phone", "+1-555-000-0000"),
                        "gps": v.get("gps", "40.0000,-75.0000"),
                        "role": "supplier",
                        "cluster_id": v_id
                    }

            # Quarter computation for partitioning
            y_q = "2024-Q1"
            if start_d:
                try:
                    dt = start_d.split("T")[0]
                    y, m, _ = dt.split("-")
                    q = (int(m) - 1) // 3 + 1
                    y_q = f"{y}-Q{q}"
                except Exception:
                    pass

            tender_rows.append((
                tender_id,
                rel.get("ocid"),
                tender.get("title", ""),
                tender.get("status", "complete"),
                cpv_code,
                cpv_desc,
                amount,
                budget,
                currency,
                start_d,
                end_d,
                duration_days,
                num_bidders,
                tender.get("awardCriteria", "lowestCost"),
                region,
                buyer_id,
                buyer_name,
                winning_vendor_id,
                winning_vendor_name,
                award_date,
                y_q
            ))

        # Insert into DuckDB inside a single fast transaction
        self.conn.execute("BEGIN TRANSACTION;")
        try:
            self.conn.executemany("""
                INSERT OR REPLACE INTO tenders VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, tender_rows)

            self.conn.executemany("""
                INSERT OR REPLACE INTO bids VALUES (?,?,?,?,?,?,?,?,?)
            """, bid_rows)

            party_rows = [
                (
                    p["id"], p["name"], p["tax_id"], p["address"],
                    p["formation_date"], p["director"], p["phone"],
                    p["gps"], p["role"], p["cluster_id"]
                )
                for p in party_dict.values()
            ]
            self.conn.executemany("""
                INSERT OR REPLACE INTO parties VALUES (?,?,?,?,?,?,?,?,?,?)
            """, party_rows)
            self.conn.execute("COMMIT;")
        except Exception as e:
            self.conn.execute("ROLLBACK;")
            raise e

        # Create indexes
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_tenders_cpv ON tenders(cpv_code);")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_tenders_yq ON tenders(year_quarter);")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_bids_tender ON bids(tender_id);")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_bids_vendor ON bids(vendor_id);")

        print(f"Ingested {len(tender_rows)} tenders, {len(bid_rows)} bids, {len(party_rows)} parties into DuckDB.")
        return len(tender_rows), len(bid_rows), len(party_rows)

    def query(self, sql: str, params=None):
        if params:
            return self.conn.execute(sql, params).fetchall()
        return self.conn.execute(sql).fetchall()

    def get_df(self, sql: str):
        return self.conn.execute(sql).fetchdf()

if __name__ == "__main__":
    print("Starting ingest_ocds script...", flush=True)
    db_file = os.path.join(os.path.dirname(__file__), "..", "data", "sentinel.duckdb")
    json_path = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "ocds_releases.json")
    print(f"Connecting to {db_file}...", flush=True)
    ingestor = OCDSIngestor(db_file)
    print("Schema initialized, parsing json...", flush=True)
    ingestor.load_ocds_json(json_path)
    print("Done ingest_ocds main!", flush=True)
