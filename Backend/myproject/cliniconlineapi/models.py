from cloudinary.models import CloudinaryField
from django.contrib.auth.models import AbstractUser
from django.db import models


# Create your models here.
class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class User(AbstractUser):
    avatar = CloudinaryField(null=True)
    phone = models.CharField(max_length=20, null=True, unique=True)
    class Role(models.TextChoices):
        CUSTOMER = "customer"
        DOCTOR = "doctor"
        HEALTHCARE = "healthcare"
    class Gender(models.TextChoices):
        MALE = "male"
        FEMALE = "female"
        OTHER = "other"

    gender = models.CharField(max_length=10, choices=Gender.choices,null=True,blank=True,default=Gender.OTHER)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)

class Specialty(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

class StaffProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    specialties = models.ManyToManyField(Specialty, through="StaffSpecialty", blank=True)
    degree = models.CharField(max_length=20, blank=True)
    experience = models.IntegerField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    price = models.FloatField(null=True, blank=True,default=0)

class CustomerProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    height = models.IntegerField(null=True, blank=True)
    weight = models.IntegerField(null=True, blank=True)

class StaffSpecialty(BaseModel):
    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE, related_name="staff_specialties")
    specialty = models.ForeignKey(Specialty, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = [("staff", "specialty")]
