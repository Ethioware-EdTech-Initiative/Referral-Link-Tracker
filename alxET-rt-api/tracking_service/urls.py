from django.urls import path, include

from .views import ClickEventViewSet, SignupEventViewSet

urlpatterns = [
        path('/track-click', ClickEventViewSet.as_view(), basename ='track_click'),
        path('track-signup', SignupEventViewSet.as_view(), basename = 'track_signup')
]
