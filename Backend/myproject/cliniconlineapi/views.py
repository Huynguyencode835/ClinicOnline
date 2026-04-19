from oauth2_provider.contrib.rest_framework import permissions
from rest_framework import viewsets, generics, parsers, status, pagination
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from cliniconlineapi import paginators, permission
from cliniconlineapi.models import User, CustomerProfile, StaffProfile, WorkDay,Appointment,TimeSlot
from cliniconlineapi.serializers import userserializer
from cliniconlineapi.serializers.AppointmentSerializer import AppointmentSerializer
from cliniconlineapi.serializers.userserializer import WorkDaySerializer, TimeSlotSerializer


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
                user = User.objects.select_related("customer_profile").get(id=request.user.id)
            else:
                user = User.objects.select_related("staff_profile").prefetch_related(
                    "staff_profile__specialties"
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
                instance = user.customer_profile
                profile_serializer = userserializer.CustomerProfileSerializer(
                    instance, data=request.data, partial=True, context={"request": request}
                )
                profile_serializer.is_valid(raise_exception=True)
                profile_serializer.save()
            else:
                instance = user.staf_profile
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
    queryset = User.objects.filter(role=User.Role.DOCTOR).select_related("staff_profile").prefetch_related("staff_profile__specialties")
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
        ).select_related("staff_profile").prefetch_related(
            "staff_profile__specialties",
            "staff_profile__workday_set__timeslot_set"
        ).get(pk=pk)
        return Response(userserializer.UserSerializer(user).data, status=status.HTTP_200_OK)

class WorkDayViewSet(viewsets.ViewSet, generics.ListAPIView):
    permission_classes = [permission.IsStaffRole]
    serializer_class = WorkDaySerializer

    def get_queryset(self):
        return WorkDay.objects.filter(
            staff_profile = self.request.user.staff_profile
        ).prefetch_related('time_slots')

    def create(self, request):
        """Tạo ngày làm việc"""
        s = WorkDaySerializer(data=request.data, context={"request": request})
        s.is_valid(raise_exception=True)
        workday = s.save(staff_profile=request.user.staff_profile)
        return Response(WorkDaySerializer(workday).data, status=status.HTTP_201_CREATED)

    @action(methods=["POST"], detail=True, url_path="add-timeslot",url_name="add-timeslot")
    def add_timeslot(self, request, pk=None):
        """Thêm khung giờ vào ngày làm việc"""
        try:
            workday = WorkDay.objects.get(pk=pk, staff_profile=request.user.staff_profile)
        except WorkDay.DoesNotExist:
            return Response({"detail": "Không tìm thấy."}, status=404)

        s = TimeSlotSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        timeslot = s.save(work_day=workday)
        return Response(TimeSlotSerializer(timeslot).data, status=status.HTTP_201_CREATED)

    @action(methods=["PATCH", "DELETE"], detail=True, url_path="detail")
    def workday_detail(self, request, pk=None):
        """Sửa hoặc xóa ngày làm việc"""
        try:
            workday = WorkDay.objects.get(pk=pk, staff_profile=request.user.staff_profile)
        except WorkDay.DoesNotExist:
            return Response({"detail": "Không tìm thấy."}, status=404)

        if request.method == "DELETE":
            workday.delete()
            return Response({"message": "Đã xóa."}, status=status.HTTP_204_NO_CONTENT)

        s = WorkDaySerializer(workday, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(WorkDaySerializer(workday).data)


class AppointmentViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.DOCTOR:
            # Bác sĩ xem lịch hẹn của mình
            return Appointment.objects.filter(
                time_slot__work_day__staff_profile__user=user
            ).select_related(
                'customer__user',
                'time_slot__work_day__staff_profile__user'
            )
        # Bệnh nhân xem lịch của mình
        customer = CustomerProfile.objects.get(user=user)
        return Appointment.objects.filter(
            customer=customer
        ).select_related(
            'time_slot__work_day__staff_profile__user'
        )

    # GET /appointments/
    def list(self, request):
        appointments = self.get_queryset()
        return Response(
            AppointmentSerializer(appointments, many=True).data
        )

    # GET /appointments/{id}/
    def retrieve(self, request, pk=None):
        try:
            appointment = self.get_queryset().get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({"detail": "Không tìm thấy lịch hẹn."}, status=404)
        return Response(AppointmentSerializer(appointment).data)

    # POST /appointments/
    def create(self, request):
        """Bệnh nhân đặt lịch"""
        if request.user.role != User.Role.CUSTOMER:
            return Response(
                {"detail": "Chỉ bệnh nhân mới được đặt lịch!"},
                status=status.HTTP_403_FORBIDDEN
            )

        s = AppointmentSerializer(data=request.data, context={"request": request})
        s.is_valid(raise_exception=True)

        time_slot = s.validated_data['time_slot']

        # Kiểm tra slot còn trống
        if time_slot.status != TimeSlot.Status.AVAILABLE:
            return Response(
                {"detail": "Khung giờ này đã được đặt!"},
                status=status.HTTP_400_BAD_REQUEST
            )

        customer = CustomerProfile.objects.get(user=request.user)
        appointment = s.save(customer=customer)

        # Cập nhật slot → Booked
        time_slot.status = TimeSlot.Status.BOOKED
        time_slot.save()

        return Response(
            AppointmentSerializer(appointment).data,
            status=status.HTTP_201_CREATED
        )

    @action(methods=["PATCH"], detail=True, url_path="confirm",
            permission_classes=[permission.IsStaffRole])
    def confirm(self, request, pk=None):
        """Bác sĩ xác nhận lịch hẹn"""
        try:
            appointment = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({"detail": "Không tìm thấy."}, status=404)

        if appointment.status != Appointment.Status.PENDING:
            return Response(
                {"detail": "Chỉ xác nhận được lịch đang chờ!"},
                status=status.HTTP_400_BAD_REQUEST
            )

        appointment.status = Appointment.Status.CONFIRMED
        appointment.save()


        return Response(AppointmentSerializer(appointment).data)

    @action(methods=["PATCH"], detail=True, url_path="cancel")
    def cancel(self, request, pk=None):
        """Hủy lịch hẹn"""
        try:
            appointment = self.get_queryset().get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({"detail": "Không tìm thấy."}, status=404)

        if appointment.status == Appointment.Status.COMPLETED:
            return Response(
                {"detail": "Không thể hủy lịch đã khám xong!"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Trả lại slot → Available
        appointment.time_slot.status = TimeSlot.Status.AVAILABLE
        appointment.time_slot.save()

        appointment.status = Appointment.Status.CANCELED
        appointment.save()

        return Response({"message": "Hủy lịch hẹn thành công!"})

    @action(methods=["GET"], detail=False, url_path="today",
            permission_classes=[permission.IsStaffRole])
    def today(self, request):
        """Bác sĩ xem lịch hẹn hôm nay"""
        today = timezone.now().date()
        appointments = self.get_queryset().filter(
            time_slot__specific_date=today
        )
        return Response(AppointmentSerializer(appointments, many=True).data)