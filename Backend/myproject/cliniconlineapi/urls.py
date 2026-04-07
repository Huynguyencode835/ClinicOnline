from django.urls import path, re_path, include
from rest_framework.routers import DefaultRouter
from cliniconlineapi import views

router = DefaultRouter()
router.register('users', views.UserViewSet, basename='user')
router.register('doctors', views.DoctorProfileViewSet, basename='doctors')


urlpatterns = [
    path('', include(router.urls)),
]
