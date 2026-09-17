"""
Data generator for Project Sentinel: Public Procurement Audit Suite (Indian Procurement Context).
Generates compliant OCDS releases localized strictly to India:
- Indian public authorities (NHAI, AIIMS, Ministry of Railways, DRDO, CPWD, BMC)
- Indian enterprise vendors (Apex Infra India, Vardhan Paving, Wipro GE Healthcare, L&T, Dilip Buildcon)
- Indian currency: INR (₹) formatted in Crores (Cr) and Lakhs (L)
- Indian regulatory identifiers: GSTIN, CIN, LLPIN, PAN, and Indian statutory rules (Competition Act 2002 Sec 3(3), GFR 2017 Rule 166 PAC).
"""

import json
import os
import random
from datetime import datetime, timedelta

def generate_indian_ocds_dataset(output_path: str, count: int = 500):
    random.seed(42)
    
    # Load CPV reference
    ref_file = os.path.join(os.path.dirname(__file__), "reference", "cpv_reference.json")
    with open(ref_file, "r", encoding="utf-8") as f:
        cpv_ref = json.load(f)

    buyers = [
        {"id": "BUY-NHAI-01", "name": "National Highways Authority of India (NHAI)", "region": "Northern Region (Delhi HQ)", "address": "G-5 & 6, Sector-10, Dwarka, New Delhi 110075"},
        {"id": "BUY-MSRDC-02", "name": "Maharashtra State Road Development Corp (MSRDC)", "region": "Western Region (Mumbai)", "address": "Bandra Reclamation, K.C. Marg, Bandra West, Mumbai 400050"},
        {"id": "BUY-AIIMS-01", "name": "All India Institute of Medical Sciences (AIIMS)", "region": "Northern Region (New Delhi)", "address": "Ansari Nagar, New Delhi 110029"},
        {"id": "BUY-AIIMS-02", "name": "AIIMS Bhubaneswar Hospital Complex", "region": "Eastern Region (Odisha)", "address": "Sijua, Patrapada, Bhubaneswar, Odisha 751019"},
        {"id": "BUY-RAIL-01", "name": "Ministry of Railways / Northern Railway Zone", "region": "Northern Region (New Delhi)", "address": "Baroda House, Copernicus Marg, New Delhi 110001"},
        {"id": "BUY-DRDO-01", "name": "Aeronautical Development Agency (DRDO-ADA)", "region": "Southern Region (Bengaluru)", "address": "P.B. No. 1718, Vimanapura Post, Bengaluru 560017"},
        {"id": "BUY-BMC-01", "name": "Brihanmumbai Municipal Corporation (BMC/MCGM)", "region": "Western Region (Mumbai)", "address": "MCGM Head Office, Mahapalika Marg, Fort, Mumbai 400001"},
        {"id": "BUY-NIC-01", "name": "National Informatics Centre (MeitY)", "region": "Northern Region (New Delhi)", "address": "A-Block, CGO Complex, Lodhi Road, New Delhi 110003"},
        {"id": "BUY-CPWD-01", "name": "Central Public Works Department (CPWD)", "region": "Central Region (Bhopal)", "address": "Nirman Bhawan, New Delhi 110011"},
    ]

    # Pre-defined cartel vendors (Highway Paving Ring on NH-44 & Maharashtra Corridors)
    cartel_vendors = [
        {
            "id": "VEND-APEX-IN-01",
            "name": "Apex Infra Concessions India Pvt Ltd",
            "tax_id": "27AABCA4882R1ZM", # GSTIN (Maharashtra)
            "cin": "U45203MH2015PTC261890",
            "address": "Plot 104, Sector 2, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093",
            "formation_date": "2015-03-12",
            "director": "Arvind Vaidya (DIN: 07129481)",
            "phone": "+91-22-6891-4821",
            "gps": "19.1136,72.8697"
        },
        {
            "id": "VEND-VARDHAN-IN-02",
            "name": "Vardhan Paving & Roadworks LLP",
            "tax_id": "27AABCA4883R1ZN", # Shared GSTIN PAN prefix AABCA488*
            "cin": "LLPIN-AAG-4882",
            "address": "Plot 104, Sector 2, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093", # Identical MIDC address!
            "formation_date": "2016-07-22",
            "director": "Arvind Vaidya (Designated Partner)", # Common director!
            "phone": "+91-22-6891-4822",
            "gps": "19.1136,72.8697"
        },
        {
            "id": "VEND-TRISHUL-IN-03",
            "name": "Trishul Infrastructure Consortium Ltd",
            "tax_id": "27AABCA4889R1ZT",
            "cin": "U45203MH2017PLC291410",
            "address": "Plot 110, Sector 2, MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093",
            "formation_date": "2017-01-15",
            "director": "Sunil R. Vaidya (DIN: 07891234)",
            "phone": "+91-22-6891-4899",
            "gps": "19.1140,72.8701"
        }
    ]

    # Indian IT Cartel vendors
    it_cartel_vendors = [
        {
            "id": "VEND-NEXUS-IN-01",
            "name": "Nexus Cloud Systems India Pvt Ltd",
            "tax_id": "29AAACN9912X1Z5", # Karnataka GSTIN
            "cin": "U72200KA2018PTC112345",
            "address": "Tower 4, 3rd Floor, Electronic City Phase 1, Hosur Road, Bengaluru, Karnataka 560100",
            "formation_date": "2018-02-10",
            "director": "Manish K. Rao (DIN: 08129031)",
            "phone": "+91-80-4112-9912",
            "gps": "12.8452,77.6602"
        },
        {
            "id": "VEND-SYNAPSE-IN-02",
            "name": "Synapse Digital Solutions India LLP",
            "tax_id": "29AAACN9913Y1Z6", # Matching GSTIN PAN AAACN991*
            "cin": "LLPIN-AAL-9913",
            "address": "Tower 4, 3rd Floor, Electronic City Phase 1, Hosur Road, Bengaluru, Karnataka 560100", # Identical office!
            "formation_date": "2019-09-01",
            "director": "Manish K. Rao (Designated Partner)",
            "phone": "+91-80-4112-9913",
            "gps": "12.8452,77.6602"
        }
    ]

    # Authorized sole-source monopoly vendors (India)
    mri_monopoly_vendor = {
        "id": "VEND-GE-INDIA-01",
        "name": "Wipro GE Healthcare Pvt Ltd",
        "tax_id": "29AAACW1293P1Z3", # GSTIN Karnataka
        "cin": "U33110KA1990PTC010834",
        "address": "Plot No. 4, Kadugodi Industrial Area, Sadaramangala, Whitefield, Bengaluru, Karnataka 560067",
        "formation_date": "1990-03-27",
        "director": "Dr. Shravan Subramanyam",
        "phone": "+91-80-4180-1000",
        "gps": "12.9934,77.7554"
    }

    defense_monopoly_vendor = {
        "id": "VEND-HAL-AVIONICS-01",
        "name": "Hindustan Aeronautics Limited (HAL) Avionics Division",
        "tax_id": "09AAACH0098P1Z8", # GSTIN UP
        "cin": "L35301KA1963GOI001622",
        "address": "Avionics Division, HAL Post Office, Korwa Industrial Area, Amethi, UP 227412",
        "formation_date": "1963-12-23",
        "director": "C.B. Ananthakrishnan",
        "phone": "+91-5368-255001",
        "gps": "26.1363,81.8294"
    }

    # Real-world Indian EPC and government suppliers
    indian_contractors = [
        {"id": "VEND-LT-01", "name": "Larsen & Toubro Limited (Heavy Civil)", "tax_id": "27AAACL0149Q1ZH", "address": "L&T House, Ballard Estate, Mumbai 400001", "director": "S.N. Subrahmanyan", "phone": "+91-22-6752-5656", "gps": "18.9348,72.8402"},
        {"id": "VEND-DBL-02", "name": "Dilip Buildcon Limited", "tax_id": "23AABCD3214E1Z4", "address": "Plot No. 5, Inside Govind Narayan Singh Gate, Kolar Road, Bhopal 462042", "director": "Dilip Suryavanshi", "phone": "+91-755-402-9999", "gps": "23.1901,77.4244"},
        {"id": "VEND-KNR-03", "name": "KNR Constructions Limited", "tax_id": "36AABCK1234F1Z8", "address": "KNR House, 3rd Floor, Kavuri Hills, Hyderabad 500033", "director": "K. Narasimha Reddy", "phone": "+91-40-4026-8761", "gps": "17.4399,78.3908"},
        {"id": "VEND-AFCONS-04", "name": "Afcons Infrastructure Limited", "tax_id": "27AAACA1092G1Z9", "address": "Afcons House, 16 Veera Desai Road, Andheri West, Mumbai 400053", "director": "K. Subramanian", "phone": "+91-22-6719-1000", "gps": "19.1363,72.8277"},
        {"id": "VEND-ASHOKA-05", "name": "Ashoka Buildcon Limited", "tax_id": "27AAACA2831H1Z1", "address": "Ashoka House, Ashoka Marg, Wadala, Nashik 422011", "director": "Satish Parakh", "phone": "+91-253-301-1705", "gps": "19.9872,73.7909"},
        {"id": "VEND-TATA-06", "name": "Tata Projects Limited", "tax_id": "27AAACT0092J1Z3", "address": "One Boulevard, Lake Boulevard Road, Powai, Mumbai 400076", "director": "Vinayak Pai", "phone": "+91-22-6625-5678", "gps": "19.1245,72.9090"},
        {"id": "VEND-JKUMAR-07", "name": "J. Kumar Infraprojects Limited", "tax_id": "27AABCJ4567K1Z5", "address": "J. Kumar House, CTS No. 448, 449, Subhash Road, Vile Parle East, Mumbai 400057", "director": "Kamal J. Gupta", "phone": "+91-22-6774-3555", "gps": "19.0988,72.8471"},
        {"id": "VEND-PNC-08", "name": "PNC Infratech Limited", "tax_id": "09AAACP4321L1Z7", "address": "PNC Tower, 3/22-D, Civil Lines, Bypass Road, NH-2, Agra 282002", "director": "Pradeep Kumar Jain", "phone": "+91-562-405-4400", "gps": "27.2038,77.9944"},
        {"id": "VEND-HGINFRA-09", "name": "H.G. Infra Engineering Limited", "tax_id": "08AABCH1098M1Z9", "address": "14, Panchwati Colony, Ratanada, Jodhpur, Rajasthan 342001", "director": "Harendra Singh", "phone": "+91-291-251-5327", "gps": "26.2758,73.0421"},
        {"id": "VEND-NCC-10", "name": "NCC Limited", "tax_id": "36AAACN2109N1Z2", "address": "NCC House, Madhapur, Hyderabad, Telangana 500081", "director": "A.A.V. Ranga Raju", "phone": "+91-40-2326-8888", "gps": "17.4483,78.3915"},
        {"id": "VEND-ITD-11", "name": "ITD Cementation India Limited", "tax_id": "27AAACI1982P1Z4", "address": "National Plastic Building, A-Subhash Road, Paranjpe B Scheme, Vile Parle East, Mumbai 400057", "director": "Jayanta Basu", "phone": "+91-22-6693-1600", "gps": "19.1001,72.8465"},
        {"id": "VEND-WELSPUN-12", "name": "Welspun Enterprises Limited", "tax_id": "27AAACW8765Q1Z6", "address": "Welspun House, Kamala City, Senapati Bapat Marg, Lower Parel West, Mumbai 400013", "director": "B.K. Goenka", "phone": "+91-22-6613-6000", "gps": "18.9986,72.8317"}
    ]

    releases = []
    base_date = datetime(2024, 1, 15)

    # 1. THE CONTEXT TRAP (AIIMS 3.0T MRI Sole Source - GFR 2017 Rule 166 PAC)
    # Value: ₹10,25,00,000 (₹10.25 Cr) on budget ₹10,50,00,000 (₹10.50 Cr)
    releases.append({
        "ocid": "ocds-gem-aiims-2024-9402",
        "id": "rel-aiims-9402",
        "date": "2024-03-10T10:00:00Z",
        "tag": ["award"],
        "initiationType": "tender",
        "buyer": buyers[2], # AIIMS New Delhi
        "tender": {
            "id": "T-9402",
            "title": "AIIMS Ansari Nagar: Supply & Commissioning of Whole Body 3.0 Tesla Superconducting MRI Imaging System",
            "status": "complete",
            "classification": {
                "scheme": "CPV",
                "id": "33115100-3",
                "description": "High-Field 3.0T MRI Scanners & Diagnostic Imaging Systems"
            },
            "value": {"amount": 102500000.0, "currency": "INR"}, # ₹10.25 Cr
            "budget": {"amount": 105000000.0, "currency": "INR"}, # ₹10.50 Cr
            "tenderPeriod": {
                "startDate": "2024-02-01T08:00:00Z",
                "endDate": "2024-03-08T17:00:00Z",
                "durationInDays": 36
            },
            "numberOfTenderers": 1,
            "awardCriteria": "Single Tender Inquiry (GFR Rule 166 PAC)",
            "region": "Northern Region (New Delhi)"
        },
        "bids": {
            "details": [
                {
                    "id": "bid-9402-1",
                    "tenderers": [mri_monopoly_vendor],
                    "value": {"amount": 102500000.0, "currency": "INR"},
                    "status": "valid",
                    "date": "2024-03-05T14:20:00Z"
                }
            ]
        },
        "awards": [
            {
                "id": "award-9402-1",
                "status": "active",
                "date": "2024-03-10T09:30:00Z",
                "value": {"amount": 102500000.0, "currency": "INR"},
                "suppliers": [mri_monopoly_vendor]
            }
        ]
    })

    # 2. THE CARTEL RING CLIMAX (Tender #8841 - NHAI National Highway 44 Bituminous Resurfacing)
    # Value: ₹48,50,00,000 (₹48.50 Cr) on budget ₹48,60,00,000 (₹48.60 Cr) — 99.79% ceiling proximity!
    releases.append({
        "ocid": "ocds-nhai-hwy-2024-8841",
        "id": "rel-nhai-8841",
        "date": "2024-04-18T16:00:00Z",
        "tag": ["award"],
        "initiationType": "tender",
        "buyer": buyers[0], # NHAI Delhi
        "tender": {
            "id": "T-8841",
            "title": "NHAI NH-44 Corridor (Km 182-248): Dense Bituminous Macadam Resurfacing & Crash Barrier Reconstruction",
            "status": "complete",
            "classification": {
                "scheme": "CPV",
                "id": "45233120-6",
                "description": "National Highway Bituminous Concrete Paving & Median Reconstruction"
            },
            "value": {"amount": 485000000.0, "currency": "INR"}, # ₹48.50 Cr
            "budget": {"amount": 486000000.0, "currency": "INR"}, # ₹48.60 Cr (99.79% ceiling proximity!)
            "tenderPeriod": {
                "startDate": "2024-04-14T08:00:00Z",
                "endDate": "2024-04-16T08:00:00Z",
                "durationInDays": 2 # 48-hour submission window right before Ambedkar Jayanti / weekend!
            },
            "numberOfTenderers": 3,
            "awardCriteria": "lowestCost",
            "region": "Northern Region (Delhi HQ)"
        },
        "bids": {
            "details": [
                {
                    "id": "bid-8841-1",
                    "tenderers": [cartel_vendors[0]], # Apex Infra - WINNER (₹48.50 Cr)
                    "value": {"amount": 485000000.0, "currency": "INR"},
                    "status": "valid",
                    "date": "2024-04-15T10:11:00Z"
                },
                {
                    "id": "bid-8841-2",
                    "tenderers": [cartel_vendors[2]], # Trishul Infra - Cover Bid (₹48.65 Cr - +0.3% margin)
                    "value": {"amount": 486500000.0, "currency": "INR"},
                    "status": "valid",
                    "date": "2024-04-15T11:45:00Z"
                },
                {
                    "id": "bid-8841-3",
                    "tenderers": [cartel_vendors[1]], # Vardhan Paving - Disqualified Over-Bid (₹51.20 Cr)
                    "value": {"amount": 512000000.0, "currency": "INR"},
                    "status": "disqualified",
                    "date": "2024-04-15T14:02:00Z"
                }
            ]
        },
        "awards": [
            {
                "id": "award-8841-1",
                "status": "active",
                "date": "2024-04-18T15:45:00Z",
                "value": {"amount": 485000000.0, "currency": "INR"},
                "suppliers": [cartel_vendors[0]]
            }
        ]
    })

    # Generate 14 historical co-bidding records for Apex, Vardhan, Trishul
    # Establishing the 15/15 Jaccard 1.00 co-occurrence and North/South market division!
    for i in range(1, 15):
        t_id = f"T-HIST-NHAI-{i:02d}"
        t_date = base_date + timedelta(days=i * 14)
        is_north = (i % 2 == 1)
        winner_vendor = cartel_vendors[0] if is_north else cartel_vendors[1]
        other_cartel = cartel_vendors[1] if is_north else cartel_vendors[0]
        cover_vendor = cartel_vendors[2]

        base_amt = 350000000.0 + (i * 11000000.0)
        ceiling = base_amt * 1.002

        releases.append({
            "ocid": f"ocds-nhai-hist-2023-{i:03d}",
            "id": f"rel-hist-nhai-{i}",
            "date": t_date.strftime("%Y-%m-%dT12:00:00Z"),
            "tag": ["award"],
            "initiationType": "tender",
            "buyer": buyers[0] if is_north else buyers[1],
            "tender": {
                "id": t_id,
                "title": f"NHAI Package {100+i}: High-Density Expressway Surface Renewal (Chainage {150+i*10} to {180+i*10})",
                "status": "complete",
                "classification": {
                    "scheme": "CPV",
                    "id": "45233120-6",
                    "description": "National Highway Bituminous Concrete Paving & Median Reconstruction"
                },
                "value": {"amount": round(base_amt, 2), "currency": "INR"},
                "budget": {"amount": round(ceiling, 2), "currency": "INR"},
                "tenderPeriod": {
                    "startDate": (t_date - timedelta(days=15)).strftime("%Y-%m-%dT08:00:00Z"),
                    "endDate": (t_date - timedelta(days=1)).strftime("%Y-%m-%dT17:00:00Z"),
                    "durationInDays": 14
                },
                "numberOfTenderers": 3,
                "awardCriteria": "lowestCost",
                "region": "Northern Region (Delhi HQ)" if is_north else "Western Region (Mumbai)"
            },
            "bids": {
                "details": [
                    {
                        "id": f"bid-{t_id}-win",
                        "tenderers": [winner_vendor],
                        "value": {"amount": round(base_amt, 2), "currency": "INR"},
                        "status": "valid",
                        "date": t_date.strftime("%Y-%m-%dT09:00:00Z")
                    },
                    {
                        "id": f"bid-{t_id}-cov1",
                        "tenderers": [other_cartel],
                        "value": {"amount": round(base_amt * 1.018, 2), "currency": "INR"},
                        "status": "valid",
                        "date": t_date.strftime("%Y-%m-%dT10:00:00Z")
                    },
                    {
                        "id": f"bid-{t_id}-cov2",
                        "tenderers": [cover_vendor],
                        "value": {"amount": round(base_amt * 1.045, 2), "currency": "INR"},
                        "status": "valid",
                        "date": t_date.strftime("%Y-%m-%dT11:00:00Z")
                    }
                ]
            },
            "awards": [
                {
                    "id": f"award-{t_id}",
                    "status": "active",
                    "date": t_date.strftime("%Y-%m-%dT12:00:00Z"),
                    "value": {"amount": round(base_amt, 2), "currency": "INR"},
                    "suppliers": [winner_vendor]
                }
            ]
        })

    # 3. INDIAN IT CARTEL CASE (Tender #5520 - MeitY Cloud Data Center Container Modernization)
    releases.append({
        "ocid": "ocds-meity-it-2024-5520",
        "id": "rel-meity-5520",
        "date": "2024-05-12T14:00:00Z",
        "tag": ["award"],
        "initiationType": "tender",
        "buyer": buyers[7], # NIC / MeitY
        "tender": {
            "id": "T-5520",
            "title": "National Informatics Centre: Cloud Container Engine Modernization & Multi-Zone DR Setup",
            "status": "complete",
            "classification": {
                "scheme": "CPV",
                "id": "72200000-7",
                "description": "Mission Mode e-Governance Cloud & Data Platform Architecture"
            },
            "value": {"amount": 28900000.0, "currency": "INR"}, # ₹2.89 Cr
            "budget": {"amount": 29000000.0, "currency": "INR"}, # ₹2.90 Cr (99.6% proximity)
            "tenderPeriod": {
                "startDate": "2024-05-08T08:00:00Z",
                "endDate": "2024-05-10T17:00:00Z",
                "durationInDays": 2
            },
            "numberOfTenderers": 2,
            "awardCriteria": "lowestCost",
            "region": "Northern Region (New Delhi)"
        },
        "bids": {
            "details": [
                {
                    "id": "bid-5520-1",
                    "tenderers": [it_cartel_vendors[0]],
                    "value": {"amount": 28900000.0, "currency": "INR"},
                    "status": "valid",
                    "date": "2024-05-09T11:00:00Z"
                },
                {
                    "id": "bid-5520-2",
                    "tenderers": [it_cartel_vendors[1]],
                    "value": {"amount": 29400000.0, "currency": "INR"},
                    "status": "valid",
                    "date": "2024-05-09T14:30:00Z"
                }
            ]
        },
        "awards": [
            {
                "id": "award-5520-1",
                "status": "active",
                "date": "2024-05-12T13:45:00Z",
                "value": {"amount": 28900000.0, "currency": "INR"},
                "suppliers": [it_cartel_vendors[0]]
            }
        ]
    })

    # 4. Generate remaining Indian public procurement tenders across diverse CPV sectors
    all_cpv_keys = list(cpv_ref.keys())
    for i in range(1, count - len(releases) + 1):
        cpv_code = random.choice(all_cpv_keys)
        cpv_info = cpv_ref[cpv_code]
        buyer = random.choice(buyers)

        t_id = f"T-IN-{1000 + i}"
        days_offset = random.randint(10, 360)
        t_date = base_date + timedelta(days=days_offset)

        is_monopoly_sector = cpv_info["natural_monopoly"]
        if is_monopoly_sector and random.random() < 0.75:
            # GFR 2017 Rule 166 PAC Sole-Source
            vendor = defense_monopoly_vendor if "3561" in cpv_code else mri_monopoly_vendor
            duration_days = random.randint(25, 45)
            val = cpv_info["baseline_unit_price"] * random.uniform(0.92, 1.10)
            budget = val * random.uniform(1.02, 1.15)
            bids_list = [
                {
                    "id": f"bid-{t_id}-1",
                    "tenderers": [vendor],
                    "value": {"amount": round(val, 2), "currency": "INR"},
                    "status": "valid",
                    "date": (t_date - timedelta(days=random.randint(2, 8))).strftime("%Y-%m-%dT10:00:00Z")
                }
            ]
            winner = vendor
        else:
            # Competitive Indian bidding
            num_bids = random.choice([3, 4, 5, 6])
            selected_vendors = random.sample(indian_contractors, min(num_bids, len(indian_contractors)))
            duration_days = random.randint(15, 35)

            if random.random() < 0.04:
                duration_days = random.choice([1, 2, 3]) # Short window anomaly

            base_price = cpv_info["baseline_unit_price"] * random.uniform(0.75, 1.30)
            budget = base_price * random.uniform(1.05, 1.25)

            bids_list = []
            prices = []
            for j, v in enumerate(selected_vendors):
                p = base_price * (1.0 + (j * random.uniform(0.015, 0.06)))
                prices.append((p, v))
                bids_list.append({
                    "id": f"bid-{t_id}-{j+1}",
                    "tenderers": [v],
                    "value": {"amount": round(p, 2), "currency": "INR"},
                    "status": "valid",
                    "date": (t_date - timedelta(days=random.randint(1, 4))).strftime("%Y-%m-%dT11:00:00Z")
                })

            prices.sort(key=lambda x: x[0])
            val = prices[0][0]
            winner = prices[0][1]

        releases.append({
            "ocid": f"ocds-gem-in-2024-{i:04d}",
            "id": f"rel-{t_id}",
            "date": t_date.strftime("%Y-%m-%dT14:00:00Z"),
            "tag": ["award"],
            "initiationType": "tender",
            "buyer": buyer,
            "tender": {
                "id": t_id,
                "title": f"{cpv_info['sector']} - GeM/CPWD Ref {i:04d}: {cpv_info['name']}",
                "status": "complete",
                "classification": {
                    "scheme": "CPV",
                    "id": cpv_code,
                    "description": cpv_info["name"]
                },
                "value": {"amount": round(val, 2), "currency": "INR"},
                "budget": {"amount": round(budget, 2), "currency": "INR"},
                "tenderPeriod": {
                    "startDate": (t_date - timedelta(days=duration_days)).strftime("%Y-%m-%dT08:00:00Z"),
                    "endDate": (t_date - timedelta(days=1)).strftime("%Y-%m-%dT17:00:00Z"),
                    "durationInDays": duration_days
                },
                "numberOfTenderers": len(bids_list),
                "awardCriteria": "L1 lowestCost",
                "region": buyer.get("region", "Northern Region (New Delhi)")
            },
            "bids": {"details": bids_list},
            "awards": [
                {
                    "id": f"award-{t_id}",
                    "status": "active",
                    "date": t_date.strftime("%Y-%m-%dT14:00:00Z"),
                    "value": {"amount": round(val, 2), "currency": "INR"},
                    "suppliers": [winner]
                }
            ]
        })

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({"releases": releases}, f, indent=2)

    print(f"Successfully generated {len(releases)} Indian procurement OCDS releases at {output_path}")

if __name__ == "__main__":
    out_file = os.path.join(os.path.dirname(__file__), "raw", "ocds_releases.json")
    generate_indian_ocds_dataset(out_file, count=500)
