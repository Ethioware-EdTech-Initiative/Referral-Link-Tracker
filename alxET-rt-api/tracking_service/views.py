from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import SignupEventSerializer, ClickEventSerializer
from dashboard_service.models import ReferralLink
from dashboard_service.models import ReferralLink


class ClickEventView(APIView):
    def post(self, request, *args, **kwargs):
        ref_code = request.data.get('refcode')
        if ref_code is None:
            return Response({"error": "Referral code is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            referral_link = ReferralLink.objects.get(ref_code=ref_code)
            referral_link.click_count += 1
            referral_link.save()

            data = {
                "referral_link": referral_link.id,
                "ip": request.META.get('REMOTE_ADDR'),
                "user_agent": request.META.get('HTTP_USER_AGENT', ''),
                "geo_country": request.data.get('geo_country'),
                "geo_city": request.data.get('geo_city'),
                "geo_region": request.data.get('geo_region'),
            }
            serializer = ClickEventSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ReferralLink.DoesNotExist:
            return Response({"error": "Referral link does not exist"}, status=status.HTTP_400_BAD_REQUEST)


class SignupEventView(APIView):
    def post(self, request, *args, **kwargs):
        ref_code = request.data.get('refcode')
        if ref_code is None:
            return Response({"error": "Referral code is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            referral_link = ReferralLink.objects.get(ref_code=ref_code)
            data = {
                "referral_link": referral_link.id,
                "conversion_minutes": request.data.get('conversion_minutes'),
                "click_count": request.data.get('click_count'),
                "fraud_score": request.data.get('fraud_score'),
            }
            serializer = SignupEventSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ReferralLink.DoesNotExist:
            return Response({"error": "Referral link does not exist"}, status=status.HTTP_400_BAD_REQUEST)
