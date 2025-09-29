from django.utils.timezone import now , timedelta
from .models import ClickEvent, SignupEvent
import requests

def is_proxy_ip(ip):
    API_KEY = 'm47493-402415-153218-5k4213'
    url = f"https://proxycheck.io/v2/{ip}?key={API_KEY}&vpn=1"
    try:
        response = requests.get(url, timeout=2)
        data = response.json()
        print(f"proxycheck.io response for {ip}: {data}")

        ip_data = data.get(ip, {})
        print(ip_data)
        return ip_data.get("proxy") == "yes" or ip_data.get("type") in ("VPN", "TOR")
    except Exception as e:
        print(f"proxycheck.io error: {e}")
        return False

def fraud_score_for_click_event(ip, user_agent, referral_link):
    fraud_score = 0
    recent_click = ClickEvent.objects.filter(ip=ip, timestamp__gte = now() - timedelta(hours=1)).count()
    if recent_click>10 :
        fraud_score += 5
    if is_proxy_ip(ip):
        fraud_score += 7
    if "bot" in(user_agent or "").lower():
        fraud_score += 3
    unique_links = ClickEvent.objects.filter(
        ip=ip,
        timestamp__gte=now() - timedelta(hours=1)
    ).values('referral_link').distinct().count()
    if unique_links > 3:
        fraud_score += 2

    return fraud_score

def fraud_score_for_signup_event(click_event, conversion_minutes):
    fraud_score = 0
    if conversion_minutes is not None and conversion_minutes < 1:
        fraud_score += 5
    if click_event.fraud_score > 7:
        fraud_score += 5
