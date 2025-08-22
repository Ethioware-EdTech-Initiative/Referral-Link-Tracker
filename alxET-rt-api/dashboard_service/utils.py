import hmac
import hashlib
import time
from django.conf import settings
import os
from dotenv import load_dotenv
import requests

load_dotenv()

IPINFO_URL = "https://ipinfo.io/{ip}/json"


def generate_referral_code(campaign_id: str, officer_id: str, secret_key: str = None) -> str:

    if secret_key is None:
        secret_key = settings.SECRET_KEY or os.getenv("SECRET_KEY")

    message = f"{campaign_id}:{officer_id}:{int(time.time())}".encode("utf-8")
    secret_key_bytes = secret_key.encode("utf-8")

    hash_digest = hmac.new(secret_key_bytes, message, hashlib.sha256).hexdigest()
    return hash_digest[:16]




def get_geo_details(ip: str) -> dict:
    if not ip:
        return {"country": None, "city": None, "region": None}

    try:
        resp = requests.get(IPINFO_URL.format(ip=ip), timeout=3)
        if resp.status_code == 200:
            data = resp.json()
            return {
                "country": data.get("country"),
                "city": data.get("city"),
                "region": data.get("region"),
            }
        else:
            return {"country": None, "city": None, "region": None}
    except requests.RequestException:
        return {"country": None, "city": None, "region": None}
