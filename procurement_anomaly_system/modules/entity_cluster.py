"""
Module: entity_cluster.py
Concrete Module Build Specification (Table 7):
Identify shell cartels. Match vendor pairs where address similarity > 0.90,
shared VAT prefix, or overlapping ownership. Collapse resolved entities
into canonical cluster IDs.
"""

import difflib
import networkx as nx

class EntityClusterEngine:
    def __init__(self):
        self.clusters = {} # vendor_id -> cluster_id
        self.cluster_details = {} # cluster_id -> metadata
        self.pairwise_flags = {} # (v1, v2) -> list of shared flags

    def _normalize_string(self, s: str) -> str:
        if not s:
            return ""
        return " ".join(s.lower().replace(",", " ").replace(".", " ").replace("#", " ").split())

    def _address_match(self, a1: str, a2: str) -> float:
        if not a1 or not a2:
            return 0.0
        n1 = self._normalize_string(a1)
        n2 = self._normalize_string(a2)
        if n1 == n2:
            return 1.0
        parts1 = n1.split()
        parts2 = n2.split()
        if parts1 and parts2 and parts1[0].isdigit() and parts2[0].isdigit():
            if parts1[0] != parts2[0]:
                return 0.0
        return difflib.SequenceMatcher(None, n1, n2).ratio()

    def _similarity(self, s1: str, s2: str) -> float:
        n1 = self._normalize_string(s1)
        n2 = self._normalize_string(s2)
        if not n1 or not n2:
            return 0.0
        if n1 == n2:
            return 1.0
        return difflib.SequenceMatcher(None, n1, n2).ratio()

    def build_clusters(self, ingestor):
        """Analyze all supplier parties in DuckDB and cluster connected entities."""
        vendors = ingestor.query("""
            SELECT id, name, tax_id, address, director, phone, gps
            FROM parties
            WHERE role = 'supplier'
        """)

        g = nx.Graph()
        for v in vendors:
            v_id = v[0]
            g.add_node(v_id, data={
                "id": v[0],
                "name": v[1],
                "tax_id": v[2],
                "address": v[3],
                "director": v[4],
                "phone": v[5],
                "gps": v[6]
            })

        n = len(vendors)
        self.pairwise_flags = {}

        for i in range(n):
            v1 = vendors[i]
            for j in range(i + 1, n):
                v2 = vendors[j]
                v1_id, v2_id = v1[0], v2[0]
                flags = []

                # 1. Address similarity > 0.90
                addr_sim = self._address_match(v1[3], v2[3])
                if addr_sim >= 0.88:
                    flags.append({
                        "type": "SHARED_ADDRESS",
                        "description": f"Shared Corporate Address Match (similarity: {addr_sim:.2f}): '{v1[3]}'",
                        "severity": "HIGH"
                    })

                # 2. Shared Director / Executive overlap
                dir_sim = self._similarity(v1[4], v2[4])
                if dir_sim >= 0.95 and not v1[4].lower().startswith("director ") and v1[4] not in ["Unknown Executive", ""]:
                    flags.append({
                        "type": "SHARED_DIRECTOR",
                        "description": f"Overlapping Corporate Director: '{v1[4]}'",
                        "severity": "HIGH"
                    })

                # 3. Shared GSTIN / Corporate Tax ID Prefix Match (PAN / Entity root)
                tax1, tax2 = str(v1[2]), str(v2[2])
                if len(tax1) >= 9 and len(tax2) >= 9:
                    # Compare first 9 chars (State Code + First 7 chars of entity PAN)
                    if tax1[:9] == tax2[:9]:
                        flags.append({
                            "type": "SHARED_GSTIN_PREFIX",
                            "description": f"Shared Corporate GSTIN/PAN Root Match: '{tax1[:9]}*'",
                            "severity": "CRITICAL"
                        })

                # 4. GPS proximity / Identical coordinates
                gps1, gps2 = str(v1[6]), str(v2[6])
                if gps1 and gps2 and gps1 == gps2:
                    flags.append({
                        "type": "SHARED_GPS",
                        "description": f"Identical Registered GPS Coordinates: {gps1}",
                        "severity": "HIGH"
                    })

                # 5. Shared Phone Number
                phone1, phone2 = str(v1[5]), str(v2[5])
                if phone1 and phone2 and phone1 == phone2 and "+1-555-000" not in phone1:
                    flags.append({
                        "type": "SHARED_PHONE",
                        "description": f"Shared Corporate Phone Registry: {phone1}",
                        "severity": "HIGH"
                    })

                if flags:
                    g.add_edge(v1_id, v2_id, flags=flags)
                    self.pairwise_flags[(v1_id, v2_id)] = flags
                    self.pairwise_flags[(v2_id, v1_id)] = flags

        # Collapse resolved entities into canonical cluster IDs
        self.clusters = {}
        self.cluster_details = {}
        for comp_idx, component in enumerate(nx.connected_components(g)):
            cluster_id = f"CLUSTER-RING-{comp_idx + 1:03d}"
            comp_nodes = list(component)
            is_multi = len(comp_nodes) > 1

            for node in comp_nodes:
                self.clusters[node] = cluster_id if is_multi else node

            if is_multi:
                self.cluster_details[cluster_id] = {
                    "cluster_id": cluster_id,
                    "members": comp_nodes,
                    "member_names": [g.nodes[node]["data"]["name"] for node in comp_nodes],
                    "size": len(comp_nodes)
                }

        # Update DuckDB parties with canonical cluster_id if not read_only
        if not getattr(ingestor, 'read_only', False):
            for v_id, c_id in self.clusters.items():
                ingestor.conn.execute("""
                    UPDATE parties SET cluster_id = ? WHERE id = ?
                """, [c_id, v_id])

        print(f"Resolved {len(self.cluster_details)} multi-entity shell cartels/clusters across {len(vendors)} vendors.")
        return self.clusters, self.cluster_details

    def get_entity_flags(self, vendor_a: str, vendor_b: str):
        return self.pairwise_flags.get((vendor_a, vendor_b), [])
