from locust import HttpUser, TaskSet, task, between
import threading

# Shared token storage across all Locust users
class TokenManager:
    _lock = threading.Lock()
    access_token = None
    refresh_token = None
    headers = {}

    @classmethod
    def login(cls, client):
        """
        Perform login once to get initial tokens.
        """
        with cls._lock:
            if cls.access_token:  # already logged in
                return

            login_payload = {
                "email": "hana@ethioware.org",
                "password": "hanaethioware",
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
                print("Login success, token acquired")
            else:
                print("Login failed:", response.status_code, response.text)

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
                print("Token refreshed")
            else:
                print("Failed to refresh token:", response.status_code, response.text)


class OfficerTasks(TaskSet):
    def on_start(self):
        """
        Called when each simulated user starts.
        Ensure login happens once and reuse shared token.
        """
        TokenManager.login(self.client)

    @task(3)
    def get_links(self):
        if TokenManager.headers:
            self.client.get("/alxET-rt-api/dashboard/officer-dash/links/", headers=TokenManager.headers)

    @task(2)
    def get_stats(self):
        if TokenManager.headers:
            self.client.get("/alxET-rt-api/dashboard/officer-dash/stats/", headers=TokenManager.headers)

    @task(2)
    def get_campaign_stats(self):
        if TokenManager.headers:
            self.client.get("/alxET-rt-api/dashboard/officer-dash/stats/campaigns/", headers=TokenManager.headers)

    @task(2)
    def get_timeline(self):
        if TokenManager.headers:
            self.client.get("/alxET-rt-api/dashboard/officer-dash/stats/timeline/", headers=TokenManager.headers)


class OfficerUser(HttpUser):
    tasks = [OfficerTasks]
    wait_time = between(1, 3)
    host = "http://127.0.0.1:8000"
