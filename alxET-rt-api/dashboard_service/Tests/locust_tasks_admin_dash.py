from locust import HttpUser, TaskSet, task, between
import threading

CAMPAIGN_ID = "340a0007-9374-4a8c-a400-12336f27868d"
OFFICER_ID = "9296a485-08f8-4f56-b81d-5b1fd0722e4e"


# Shared token storage for Admin users
class AdminTokenManager:
    _lock = threading.Lock()
    access_token = None
    refresh_token = None
    headers = {}

    @classmethod
    def login(cls, client):
        """
        Perform login once to get initial tokens for Admin.
        """
        with cls._lock:
            if cls.access_token:  # already logged in
                return

            login_payload = {
                "email": "nahumyne@ethioware.org",
                "password": "nahomethioware"
            }

            response = client.post("/alxET-rt-api/auth/login/", json=login_payload)

            if response.status_code == 200:
                data = response.json()
                tokens = data.get("tokens", {})
                cls.access_token = tokens.get("access")
                cls.refresh_token = tokens.get("refresh")
                cls.headers = {
                    "Authorization": f"Bearer {cls.access_token}",
                    "Content-Type": "application/json",
                }
                print("Admin login success, token acquired")
            else:
                print("Admin login failed:", response.status_code, response.text)

    @classmethod
    def refresh(cls, client):
        """
        Refresh the access token if expired.
        """
        with cls._lock:
            if not cls.refresh_token:
                return

            refresh_payload = {"refresh": cls.refresh_token}
            response = client.post("/alxET-rt-api/auth/token/refresh/", json=refresh_payload)

            if response.status_code == 200:
                new_access = response.json().get("access")
                cls.access_token = new_access
                cls.headers["Authorization"] = f"Bearer {cls.access_token}"
                print("Admin token refreshed")
            else:
                print("Failed to refresh admin token:", response.status_code, response.text)


class AdminTasks(TaskSet):
    def on_start(self):
        """
        Ensure Admin login happens once and reuse shared token.
        """
        AdminTokenManager.login(self.client)

    @task(3)
    def get_campaigns(self):
        if AdminTokenManager.headers:
            self.client.get("/alxET-rt-api/dashboard/admin-dash/campaigns/", headers=AdminTokenManager.headers)

    @task(2)
    def get_links(self):
        if AdminTokenManager.headers:
            self.client.get("/alxET-rt-api/dashboard/admin-dash/links/", headers=AdminTokenManager.headers)

    @task(1)
    def generate_link(self):
        if AdminTokenManager.headers:
            payload = {"officer": OFFICER_ID, "campaign": CAMPAIGN_ID}
            self.client.post("/alxET-rt-api/dashboard/admin-dash/links/gen-link/", json=payload, headers=AdminTokenManager.headers)

    @task(2)
    def get_metrics(self):
        if AdminTokenManager.headers:
            self.client.get("/alxET-rt-api/dashboard/admin-dash/metrics/", headers=AdminTokenManager.headers)

    @task(2)
    def get_stats(self):
        if AdminTokenManager.headers:
            self.client.get("/alxET-rt-api/dashboard/admin-dash/stats/", headers=AdminTokenManager.headers)


class AdminUser(HttpUser):
    tasks = [AdminTasks]
    wait_time = between(1, 3)
    host = "http://127.0.0.1:8000"
