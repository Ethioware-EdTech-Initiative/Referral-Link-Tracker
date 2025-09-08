from locust import HttpUser, TaskSet, task, between
import random

ADMIN_TOKENS = [
    "ACCESS_TOKEN_1",
    "ACCESS_TOKEN_2",
    "ACCESS_TOKEN_3"
]

CAMPAIGN_ID = "340a0007-9374-4a8c-a400-12336f27868d"
OFFICER_ID = "9296a485-08f8-4f56-b81d-5b1fd0722e4e"

class AdminTasks(TaskSet):
    def on_start(self):
        self.token = random.choice(ADMIN_TOKENS)
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}

    @task(3)
    def get_campaigns(self):
        self.client.get("/alxET-rt-api/dashboard/admin-dash/campaigns/", headers=self.headers)

    @task(2)
    def get_links(self):
        self.client.get("/alxET-rt-api/dashboard/admin-dash/links/", headers=self.headers)

    @task(1)
    def generate_link(self):
        payload = {"officer": OFFICER_ID, "campaign": CAMPAIGN_ID}
        self.client.post("/alxET-rt-api/dashboard/admin-dash/links/gen-link/", json=payload, headers=self.headers)

    @task(2)
    def get_metrics(self):
        self.client.get("/alxET-rt-api/dashboard/admin-dash/metrics/", headers=self.headers)

    @task(2)
    def get_stats(self):
        self.client.get("/alxET-rt-api/dashboard/admin-dash/stats/", headers=self.headers)

class AdminUser(HttpUser):
    tasks = [AdminTasks]
    wait_time = between(1, 3)
