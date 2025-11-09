"""Database connection and utilities."""

from google.cloud import bigquery
from app.core.config import settings
from typing import Optional
import os


class BigQueryClient:
    """BigQuery client wrapper."""

    def __init__(self):
        """Initialize BigQuery client lazily."""
        self._client: Optional[bigquery.Client] = None
        self.dataset_id = settings.BIGQUERY_DATASET
        self._credentials_available = self._check_credentials()

    def _check_credentials(self) -> bool:
        """Check if Google Cloud credentials are available."""
        # Check for service account key file
        if settings.GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(settings.GOOGLE_APPLICATION_CREDENTIALS):
            return True
        # Check for default credentials
        try:
            import google.auth
            google.auth.default()
            return True
        except Exception:
            return False

    @property
    def client(self) -> bigquery.Client:
        """Get or create BigQuery client."""
        if self._client is None:
            if not self._credentials_available:
                raise Exception(
                    "Google Cloud credentials not found. "
                    "Please set up credentials as described in SETUP.md. "
                    "For now, the API will start but database operations will fail."
                )
            self._client = bigquery.Client(project=settings.GOOGLE_CLOUD_PROJECT)
        return self._client

    def get_table_id(self, table_name: str) -> str:
        """Get full table ID."""
        return f"{settings.GOOGLE_CLOUD_PROJECT}.{self.dataset_id}.{table_name}"

    def query(self, query: str):
        """Execute a query."""
        if not self._credentials_available:
            print("⚠️  Warning: Google Cloud not configured. Returning empty results.")
            return []
        query_job = self.client.query(query)
        return query_job.result()

    def insert_rows(self, table_name: str, rows: list):
        """Insert rows into a table."""
        if not self._credentials_available:
            print("⚠️  Warning: Google Cloud not configured. Simulating insert.")
            return True
        table_id = self.get_table_id(table_name)
        errors = self.client.insert_rows_json(table_id, rows)
        if errors:
            raise Exception(f"Errors inserting rows: {errors}")
        return True


# Global instance
db = BigQueryClient()

