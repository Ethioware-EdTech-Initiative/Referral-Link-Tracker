import requests
import logging
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404, redirect
from .serializers import SignupEventSerializer, ClickEventSerializer, FraudFindingsSerializer
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiParameter
from rest_framework import serializers
from dashboard_service.models import ReferralLink
from .models import ClickEvent, FraudFindings, SignupEvent
from .utils import fraud_score_for_click_event, fraud_score_for_signup_event
from rest_framework.generics import ListAPIView
import re 
from django.core.validators import validate_ipv4_address, validate_ipv6_address, ValidationError

logger = logging.getLogger(__name__)


SIGNUP_URL = "https://admissions.alxafrica.com/users/sign_up/"


MAX_USER_AGENT_LENGTH = 500
MAX_IP_REQUESTS_PER_MINUTE = 60
MAX_REF_CODE_LENGTH = 70
ALLOWED_DEBUG_VALUES = {'true', '1', 'yes'}

def validate_and_sanitize_input(value, field_name, max_length=None):
    """Comprehensive input validation and sanitization"""
    if value is None:
        return None

    value = str(value).strip()

    dangerous_patterns = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'vbscript:',
        r'onload\s*=',
        r'onerror\s*=',
        r'<iframe[^>]*>',
        r'<object[^>]*>',
        r'<embed[^>]*>'
    ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, value, re.IGNORECASE):
            logger.warning(f"Potentially malicious input detected in {field_name}: {value[:100]}")
            raise ValidationError(f"Invalid {field_name} format")

    if max_length and len(value) > max_length:
        logger.warning(f"Input too long for {field_name}: {len(value)} chars")
        value = value[:max_length]
    
    return value

def validate_ip_address(ip):
    """Enhanced IP address validation with logging"""
    if not ip:
        return False
        
    try:
        ip = ip.strip()
        if not settings.DEBUG:
            private_patterns = [
                r'^127\.',      
                r'^192\.168\.', 
                r'^10\.',   
                r'^172\.(1[6-9]|2[0-9]|3[0-1])\.' 
            ]
            for pattern in private_patterns:
                if re.match(pattern, ip):
                    logger.info(f"Private IP detected: {ip}")
        
        validate_ipv4_address(ip)
        return True
    except ValidationError:
        try:
            validate_ipv6_address(ip)
            return True
        except ValidationError:
            logger.warning(f"Invalid IP address format: {ip}")
            return False

def sanitize_user_agent(user_agent):
    """Enhanced user agent sanitization with security checks"""
    if not user_agent:
        return ''

    user_agent = validate_and_sanitize_input(
        user_agent, 
        'user_agent', 
        MAX_USER_AGENT_LENGTH
    )
    
    cleaned = re.sub(r'[<>"\'\(\);\\]', '', user_agent)
    

    cleaned = re.sub(r'(script|javascript|vbscript|data:|javascript:)', 
                    '', cleaned, flags=re.IGNORECASE)
    
    return cleaned


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


class TrackingThrottle(AnonRateThrottle):
    rate = '100/hour'
    
    def get_cache_key(self, request, view):
        ip = get_client_ip(request)
        if not ip:
            return None
        user_agent_hash = hash(request.META.get('HTTP_USER_AGENT', ''))
        return f"throttle_anon_{ip}_{user_agent_hash}"

class AdminRateThrottle(UserRateThrottle):
    rate = '1000/hour'

class SignupThrottle(AnonRateThrottle):
    rate = '10/minute'


class TrackClickView(APIView):
    """
    Handles referral link clicks also device tracking...
    """
    permission_classes = [AllowAny]
    throttle_classes = [TrackingThrottle]
    
    @extend_schema(
        parameters=[
            OpenApiParameter(name="ref_code", location=OpenApiParameter.PATH, type=str),
            OpenApiParameter(name="debug", location=OpenApiParameter.QUERY, required=False, type=str),
        ],
        responses={201: ClickEventSerializer},
    )
    def get(self, request, ref_code, *args, **kwargs):
        referral_link = get_object_or_404(ReferralLink, ref_code=ref_code)
        ip = get_client_ip(request)
        country, city, region = get_geolocation(ip)
        raw_user_agent = request.META.get('HTTP_USER_AGENT', '')
        user_agent = sanitize_user_agent(raw_user_agent)
        
        
        ref_code = validate_and_sanitize_input(ref_code, "ref_code", MAX_REF_CODE_LENGTH)
        fraud_score = fraud_score_for_click_event(ip, user_agent, referral_link)

        click = ClickEvent.objects.create(
            referral_link=referral_link,
            ip=ip,
            user_agent=user_agent,
            geo_country=country,
            geo_city=city,
            geo_region=region,
            fraud_score = fraud_score
        )
        referral_link.click_count += 1
        referral_link.save(update_fields=['click_count'])
        
        if fraud_score > 7:
            FraudFindings.objects.create(
                event_type='click',
                event_id=click.id,
                fraud_score=fraud_score,
                findings_details="High fraud score on click event."
            )

        if request.GET.get("debug") == "true":
            return Response(ClickEventSerializer(click).data, status=status.HTTP_201_CREATED)
        return redirect(f"{SIGNUP_URL}?ref_code={referral_link.ref_code}&click_event_id={click.id}")



class SignupEventView(APIView):
    """
    Tracks a signup event after a candidate has clicked a referral link.
    """

    @extend_schema(
        request=inline_serializer(
            name="SignupEventRequest",
            fields={
                "refcode": serializers.CharField(),
                "click_event_id": serializers.IntegerField(),
                "fraud_score": serializers.FloatField(required=False),
            },
        ),
        responses={201: SignupEventSerializer},
    )
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
            
            fraud_score = fraud_score_for_signup_event(click_event, conversion_minutes)

            data = {
                "referral_link": referral_link.id,
                "click_event": click_event.id,
                "conversion_minutes": conversion_minutes,
                "fraud_score": fraud_score,
            }

            serializer = SignupEventSerializer(data=data)
            if serializer.is_valid():
                signup_event= serializer.save()
                if fraud_score > 7:
                    FraudFindings.objects.create(
                        event_type='signup',
                        event_id=signup_event.id,
                        fraud_score=fraud_score,
                        findings_details="High fraud score on signup event."
                    )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except ReferralLink.DoesNotExist:
            return Response({"error": "Referral link does not exist"},
                            status=status.HTTP_400_BAD_REQUEST)
        except ClickEvent.DoesNotExist:
            return Response({"error": "ClickEvent does not exist for this refcode"},
                            status=status.HTTP_400_BAD_REQUEST)
            
class FraudFindingsListView(ListAPIView):
    queryset = FraudFindings.objects.all().order_by('-id')
    serializer_class = FraudFindingsSerializer

class ClickEventListView(ListAPIView):
    queryset = ClickEvent.objects.all().order_by('-id')
    serializer_class = ClickEventSerializer
    
class SignupEventListView(ListAPIView):
    queryset = SignupEvent.objects.all().order_by('-id')
    serializer_class = SignupEventSerializer