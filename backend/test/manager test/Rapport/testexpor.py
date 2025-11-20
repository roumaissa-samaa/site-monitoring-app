import requests

base_url = "http://localhost:5000/manager/reports/export"

# Tester export CSV
response_csv = requests.get(base_url, params={"format": "csv"})
print("CSV Status:", response_csv.status_code)
with open("rapport_chantiers.csv", "wb") as f:
    f.write(response_csv.content)

# Tester export PDF
response_pdf = requests.get(base_url, params={"format": "pdf"})
print("PDF Status:", response_pdf.status_code)
with open("rapport_chantiers.pdf", "wb") as f:
    f.write(response_pdf.content)
