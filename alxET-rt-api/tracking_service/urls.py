from django.urls import path, include

from .views import TrackClickView, SignupEventView

urlpatterns = [
        path('referral/<str:ref_code>/', TrackClickView.as_view(), name='track_click'),
        path('track_signup/', SignupEventView.as_view(), name = 'track_signup')
]
