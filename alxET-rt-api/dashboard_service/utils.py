import hmac
import hashlib
import time
from django.conf import settings
import os
from dotenv import load_dotenv

load_dotenv()


def generate_referral_code(campaign_id: str, officer_id: str, secret_key: str = None) -> str:

    if secret_key is None:
        secret_key = settings.SECRET_KEY or os.getenv("SECRET_KEY")

    message = f"{campaign_id}:{officer_id}:{int(time.time())}".encode("utf-8")
    secret_key_bytes = secret_key.encode("utf-8")

    hash_digest = hmac.new(secret_key_bytes, message, hashlib.sha256).hexdigest()
    return hash_digest[:16]
