#!/usr/bin/env python3
"""
Deprecated: workshop extraction now lives on the backend.

Use instead (from `server/` folder):
  python scripts/extract_workshop_report.py --excel "C:\\path\\to\\file.xlsx" --report-date YYYY-MM-DD

Output:
  server/data/reports/YYYY-MM-DD/seed.json
  server/data/reports/YYYY-MM-DD/images/

The Express app serves these at GET /api/reports and /api/reports/:date/images/:file
"""

import sys

if __name__ == "__main__":
    print(__doc__, file=sys.stderr)
    sys.exit(1)
