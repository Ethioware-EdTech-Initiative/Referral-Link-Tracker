import requests
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404, redirect
from .serializers import SignupEventSerializer, ClickEventSerializer
from dashboard_service.models import ReferralLink
from dashboard_service.models import ReferralLink
from .models import ClickEvent

SIGNUP_URL = "https://admissions.alxafrica.com/users/sign_up/"


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    return x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')

def get_geolocation(ip):
    try:
        response = requests.get(f"https://ipinfo.io/{ip}/json")
        if response.status_code == 200:
            data = response.json()
            country = data.get("country")
            city = data.get("city")
            region = data.get("region")
            return country, city, region
    except Exception as e:
        print(f"Geo lookup failed: {e}")
    return None, None, None

class TrackClickView(APIView):
    """
    Handles referral link clicks also device tracking...
    """
    def get(self, request, ref_code, *args, **kwargs):
        referral_link = get_object_or_404(ReferralLink, ref_code=ref_code)
        ip = get_client_ip(request)
        country, city, region = get_geolocation(ip)
        click = ClickEvent.objects.create(
            referral_link=referral_link,
            ip=ip,
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            geo_country=country,
            geo_city=city,
            geo_region=region,
        )
        referral_link.click_count += 1
        referral_link.save(update_fields=['click_count'])

        if request.GET.get("debug") == "true":
            return Response(ClickEventSerializer(click).data, status=status.HTTP_201_CREATED)
        return redirect(f"{SIGNUP_URL}?ref_code={referral_link.ref_code}&click_event_id={click.id}")


class SignupEventView(APIView):
    """
    Tracks a signup event after a candidate has clicked a referral link.
    """

    def post(self, request, *args, **kwargs):
        ref_code = request.data.get('refcode')
        click_event_id = request.data.get('click_event_id')

        if not ref_code or not click_event_id:
            return Response({"error": "refcode and click_event_id are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            referral_link = ReferralLink.objects.get(ref_code=ref_code)
            click_event = ClickEvent.objects.get(id=click_event_id, referral_link=referral_link)

            conversion_minutes = None
            if click_event.timestamp:
                conversion_minutes = int((now() - click_event.timestamp).total_seconds() / 60)

            data = {
                "referral_link": referral_link.id,
                "click_event": click_event.id,
                "conversion_minutes": conversion_minutes,
                "fraud_score": request.data.get('fraud_score', 0.0),
            }

            serializer = SignupEventSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except ReferralLink.DoesNotExist:
            return Response({"error": "Referral link does not exist"},
                            status=status.HTTP_400_BAD_REQUEST)
        except ClickEvent.DoesNotExist:
            return Response({"error": "ClickEvent does not exist for this refcode"},
                            status=status.HTTP_400_BAD_REQUEST)