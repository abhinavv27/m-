"""
Integration test suite for Project Sentinel.
Tests live endpoints on http://127.0.0.1:8000 when running, or via TestClient.
"""

import os
import sys
import unittest
import requests

SERVER_URL = "http://127.0.0.1:8000"

class TestSentinelAPI(unittest.TestCase):
    def setUp(self):
        self.base_url = SERVER_URL

    def test_health_and_stats(self):
        res = requests.get(f"{self.base_url}/api/health", timeout=5)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "operational")

        res_stats = requests.get(f"{self.base_url}/api/stats", timeout=5)
        self.assertEqual(res_stats.status_code, 200)
        data = res_stats.json()
        self.assertGreater(data["total_tenders"], 0)
        self.assertIn("active_collusion_rings", data)

    def test_tenders_list(self):
        res = requests.get(f"{self.base_url}/api/tenders?limit=10", timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["items"]), 10)
        first = data["items"][0]
        self.assertIn("priority_score", first)
        self.assertIn("decomposition", first)

    def test_tender_8841_benchmark(self):
        res = requests.get(f"{self.base_url}/api/tenders/T-8841", timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        score = data["scoring"]["priority_score"]
        self.assertGreaterEqual(score, 90.0)
        self.assertEqual(data["scoring"]["category"], "HIGH_PRIORITY")

        # Test Graph endpoint
        res_graph = requests.get(f"{self.base_url}/api/tenders/T-8841/graph", timeout=5)
        self.assertEqual(res_graph.status_code, 200)
        g_data = res_graph.json()
        self.assertGreater(len(g_data["nodes"]), 1)
        self.assertGreater(len(g_data["edges"]), 1)

        # Test Price Distribution
        res_dist = requests.get(f"{self.base_url}/api/tenders/T-8841/price-distribution", timeout=5)
        self.assertEqual(res_dist.status_code, 200)
        d_data = res_dist.json()
        self.assertIn("histogram", d_data)

    def test_mri_dampening_benchmark(self):
        res = requests.get(f"{self.base_url}/api/tenders/T-9402", timeout=5)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["market_eval"]["dampening_applied"])
        self.assertLess(data["scoring"]["priority_score"], 35.0)

    def test_export_dossier(self):
        res = requests.get(f"{self.base_url}/api/tenders/T-8841/export-dossier", timeout=5)
        self.assertEqual(res.status_code, 200)
        self.assertIn("INVESTIGATIVE AUDIT DOSSIER", res.text)
        self.assertIn("T-8841", res.text)

if __name__ == "__main__":
    unittest.main()
