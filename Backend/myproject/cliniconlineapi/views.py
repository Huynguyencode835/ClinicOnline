from oauth2_provider.contrib.rest_framework import permissions
from rest_framework import viewsets, generics, parsers, status, pagination
from rest_framework.decorators import action
from rest_framework.response import Response
from cliniconlineapi import paginators, permission
from cliniconlineapi.models import User, CustomerProfile, StaffProfile, WorkDay
from cliniconlineapi.serializers import userserializer
from cliniconlineapi.serializers.userserializer import WorkDaySerializer


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
        try:
            if request.user.role == User.Role.CUSTOMER:
                user = User.objects.select_related("customerprofile").get(id=request.user.id)
            else:
                user = User.objects.select_related("staffprofile").prefetch_related(
                    "staffprofile__specialties"
                ).get(
                    id=request.user.id
                )
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.method == "GET":
            s = userserializer.UserSerializer(user, context={"request": request})
            return Response(s.data, status=status.HTTP_200_OK)

        if request.method == "PATCH":
            if user.role == User.Role.CUSTOMER:
                instance = user.customerprofile
                profile_serializer = userserializer.CustomerProfileSerializer(
                    instance, data=request.data, partial=True, context={"request": request}
                )
                profile_serializer.is_valid(raise_exception=True)
                profile_serializer.save()
            else:
                instance = user.staffprofile
                profile_serializer = userserializer.StaffProfileSerializer(
                    instance, data=request.data, partial=True, context={"request": request}
                )
                profile_serializer.is_valid(raise_exception=True)
                profile_serializer.save()

                specialty_ids = request.data.get("specialties", [])
                if specialty_ids:
                    instance.specialties.set(specialty_ids)

            return Response(
                userserializer.UserSerializer(user, context={"request": request}).data,
                status=status.HTTP_200_OK
            )

    @action(methods=["GET", "POST"],
            url_path="workday_staff",
            url_name="workday_staff",
            detail=False,
            permission_classes=[permission.IsStaffRole])
    def workday_staff(self, request):
        if request.method == "POST":
            s = userserializer.WorkDaySerializer(data=request.data, context={"request": request})
            s.is_valid(raise_exception=True)
            c = s.save(staff_profile=request.user.staffprofile)
            return Response(userserializer.WorkDaySerializer(c).data, status=status.HTTP_200_OK)
        else:
            querry = WorkDay.objects.filter(staff_profile = request.user.staffprofile)
            return Response(WorkDaySerializer(querry, many=True).data, status=status.HTTP_200_OK)

    @action(
        methods=["PATCH", "DELETE"],
        url_path="workday/(?P<pk>[^/.]+)",
        url_name="workday-detail",
        detail=False,
        permission_classes=[permission.IsStaffRole]
    )
    def workday_detail(self, request, pk=None):
        pass

class DoctorProfileViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = User.objects.filter(role=User.Role.DOCTOR).select_related("staffprofile").prefetch_related("staffprofile__specialties")
    serializer_class = userserializer.UserSerializer
    pagination_class = paginators.ItemPaginator

    @action(
        methods=["GET"],
        url_path="doctor_detail",
        url_name="doctor_detail",
        detail=True,
    )
    def doctor_detail(self, request, pk):
        user = User.objects.filter(
            role__in=[User.Role.DOCTOR, User.Role.HEALTHCARE]
        ).select_related("staffprofile").prefetch_related(
            "staffprofile__specialties",
            "staffprofile__workday_set__timeslot_set"
        ).get(pk=pk)
        return Response(userserializer.UserSerializer(user).data, status=status.HTTP_200_OK)

