import hmac
import hashlib
import time
from django.conf import settings
import os
from dotenv import load_dotenv
import secrets

load_dotenv()


def generate_referral_code(campaign_id: str, officer_id: str, secret_key: str = None, length: int = 32) -> str:
    """
    Generate a secure referral code.
    - campaign_id + officer_id + timestamp + randomness → hashed with HMAC-SHA256
    - length controls the number of hex chars returned (default 32 = 128 bits)
    """
    if secret_key is None:
        secret_key = settings.SECRET_KEY or os.getenv("SECRET_KEY")

    # Add randomness to strengthen uniqueness across simultaneous requests
    nonce = secrets.token_hex(8)  
    message = f"{campaign_id}:{officer_id}:{int(time.time())}:{nonce}".encode("utf-8")
    secret_key_bytes = secret_key.encode("utf-8")

    hash_digest = hmac.new(secret_key_bytes, message, hashlib.sha256).hexdigest()
    return hash_digest[:length]
