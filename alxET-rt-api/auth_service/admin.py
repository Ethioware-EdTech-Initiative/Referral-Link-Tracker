from django.contrib import admin
from .models import User, Officer, Audit_Log
# Register your models here.

admin.site.register([User, Officer, Audit_Log])
