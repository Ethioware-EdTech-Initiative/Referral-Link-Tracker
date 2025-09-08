from locust import HttpUser, TaskSet, task, between
import random

OFFICER_TOKENS = [
    "OFFICER_ACCESS_TOKEN_1",
    "OFFICER_ACCESS_TOKEN_2",
    "OFFICER_ACCESS_TOKEN_3",
    "OFFICER_ACCESS_TOKEN_4"
]


class OfficerTasks(TaskSet):
    def on_start(self):
        self.token = random.choice(OFFICER_TOKENS)
        self.headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}

    @task(3)
    def get_links(self):
        self.client.get("/alxET-rt-api/dashboard/officer-dash/links/", headers=self.headers)


    @task(2)
    def get_stats(self):
        self.client.get("/alxET-rt-api/dashboard/officer-dash/stats/", headers=self.headers)

    @task(2)
    def get_campaign_stats(self):
        self.client.get("/alxET-rt-api/dashboard/officer-dash/stats/campaigns/", headers=self.headers)

    @task(2)
    def get_timeline(self):
        self.client.get("/alxET-rt-api/dashboard/officer-dash/stats/timeline/", headers=self.headers)

class OfficerUser(HttpUser):
    tasks = [OfficerTasks]
    wait_time = between(1, 3)
