from oauth2_provider.contrib.rest_framework import permissions
from rest_framework import viewsets, generics, parsers, status, pagination
from rest_framework.decorators import action
from rest_framework.response import Response
from oauthlib.oauth2.rfc6749.grant_types.base import GrantTypeBase

from cliniconlineapi import paginators
from cliniconlineapi.models import User, CustomerProfile, StaffProfile, StaffSpecialty
from cliniconlineapi.serializers import userserializer
from cliniconlineapi.serializers.userserializer import CustomerProfileSerializer


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = userserializer.UserSerializer
    parser_classes = [parsers.JSONParser,
                    parsers.MultiPartParser,
                    parsers.FormParser]

    @action(methods=["GET", "PATCH"],
            url_path="profile_user",
            url_name="profile_user",
            detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def profile_user(self,request):
        if request.user.role == User.Role.CUSTOMER:
            instance = CustomerProfile.objects.select_related("user").get(user=request.user)
            serializer_class = userserializer.CustomerProfileSerializer
        else:
            instance = StaffProfile.objects.select_related("user").prefetch_related("specialties").get(user=request.user)
            serializer_class = userserializer.StaffProfileSerializer
        if request.method == "PATCH":
            s = serializer_class(instance, data=request.data, partial=True, context={'request': request})
            s.is_valid(raise_exception=True)
            if request.user.role in [User.Role.HEALTHCARE, User.Role.DOCTOR]:
                specialty_ids = request.data.get("specialties", [])

                if specialty_ids:
                    instance.specialties.set(specialty_ids)
            u = s.save()
            return Response(serializer_class(u, context={'request': request}).data, status=status.HTTP_200_OK)

        if request.method == "GET":
            s = serializer_class(instance, context={'request': request})
            return Response(s.data, status=status.HTTP_200_OK)

class DoctorProfileViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = StaffProfile.objects.filter(active=True, user__role=User.Role.DOCTOR).select_related("user").prefetch_related("specialties")
    serializer_class = userserializer.StaffProfileSerializer
    pagination_class = paginators.ItemPaginator