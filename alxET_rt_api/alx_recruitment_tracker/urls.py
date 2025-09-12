"""
URL configuration for alx_recruitment_tracker project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('alxET-rt-api/auth/', include('auth_service.urls')),
    path('alxET-rt-api/tracking/', include('tracking_service.urls')),
    path('alxET-rt-api/admin/', include('dashboard_service.admin_dashbaord.urls')),
    path('alxET-rt-api/officer/', include('dashboard_service.recruitment_officer.urls')),
    
    path('alxET-rt-api/doc/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('alxET-rt-api/doc/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('alxET-rt-api/doc/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]