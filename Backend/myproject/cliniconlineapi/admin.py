from django.contrib import admin
from .models import User, StaffSpecialty, CustomerProfile,Specialty,StaffProfile

admin.site.register(User)
admin.site.register(StaffSpecialty)
admin.site.register(CustomerProfile)
admin.site.register(Specialty)
admin.site.register(StaffProfile)

