from django.urls import path, include

from .views import TrackClickView, SignupEventView, FraudFindingsListView,  ClickEventListView, SignupEventListView

urlpatterns = [
        path('referral/<str:ref_code>/', TrackClickView.as_view(), name='track_click'),
        path('track_signup/', SignupEventView.as_view(), name='track_signup'),
        path('fraud_findings/', FraudFindingsListView.as_view(), name='fraud_findings'),
        path('click_events/', ClickEventListView.as_view(), name='click_events'),
        path('signup_events/', SignupEventListView.as_view(), name='signup_events'),
]
