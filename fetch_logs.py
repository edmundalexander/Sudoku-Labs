import os
from google.cloud import logging
from google.oauth2 import service_account

# Path to the service account key file
key_path = '/workspaces/Sudoku-Labs/backend/gas/sudoku-labs-firebase-adminsdk-fbsvc-1dbcf9956f.json'

# Authenticate using the service account
credentials = service_account.Credentials.from_service_account_file(key_path)

# Create a logging client
client = logging.Client(credentials=credentials, project='sudoku-labs')

# List entries for the 'sudoku' service
# We filter for Cloud Run Revision logs
filter_str = 'resource.type="cloud_run_revision" AND resource.labels.service_name="sudoku"'

print("Fetching logs...")
try:
    entries = client.list_entries(filter_=filter_str, order_by=logging.DESCENDING, max_results=20)
    for entry in entries:
        print(f"[{entry.timestamp}] {entry.severity}: {entry.payload}")
except Exception as e:
    print(f"Error fetching logs: {e}")
