from django.contrib import admin
from .models import ClickEvent, SignupEvent, FraudFindings
# Register your models here.
admin.site.register([ClickEvent, SignupEvent, FraudFindings])

