from django.urls import path, include

from .views import ClickEventView, SignupEventView

urlpatterns = [
        path('track_click/', ClickEventView.as_view(), name ='track_click'),
        path('track_signup/', SignupEventView.as_view(), name = 'track_signup')
]
