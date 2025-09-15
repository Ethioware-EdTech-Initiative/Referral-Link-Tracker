from locust import HttpUser, TaskSet, task, between
import random
import time


REF_CODES = [
    "f5c8194728343323",
    # "81cd468301fc1863",
    # "47b2720e2312aa42",
]

class TrackingTasks(TaskSet):
    def on_start(self):
        """
        Called when each simulated user starts.
        Pick a referral code for this user session.
        """
        self.ref_code = random.choice(REF_CODES)
        self.last_click_event_id = None

    @task(10)
    def track_click(self):
        """
        Simulate clicking a referral link.
        """
        url = f"/alxET-rt-api/tracking/referral/{self.ref_code}/?debug=true"
        with self.client.get(url, catch_response=True, allow_redirects=False) as response:
            if response.status_code == 201:
                data = response.json()
                self.last_click_event_id = data.get("id")
                response.success()
            elif response.status_code in (302, 301):  # redirect case
                response.success()
            else:
                response.failure(f"Unexpected status: {response.status_code}")

    # @task(10)
    # def track_signup(self):
    #     """
    #     Simulate a signup event for the last click.
    #     Only do this if we already tracked a click.
    #     """
    #     if not self.last_click_event_id:
    #         return

    #     payload = {
    #         "refcode": self.ref_code,
    #         "click_event_id": self.last_click_event_id,
    #     }

    #     with self.client.post("/alxET-rt-api/tracking/signup/", json=payload, catch_response=True) as response:
    #         if response.status_code == 201:
    #             response.success()
    #             self.last_click_event_id = None
    #         else:
    #             response.failure(f"Signup failed: {response.status_code} {response.text}")


class TrackingUser(HttpUser):
    tasks = [TrackingTasks]
    wait_time = between(1, 3)
    host = "http://127.0.0.1:8000"
