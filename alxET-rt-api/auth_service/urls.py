from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

from .views import UserViewSet, LoginView, LogOutView, ChangePasswordView


router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/',LogOutView.as_view(), name = 'logout'),
    path('change_password/', ChangePasswordView.as_view(), name='change_password')
]
