import os
from datetime import date, timedelta
import time
from django.db.models import Count, Q, Case, When, Value, CharField, Sum, F
from django.db.models.functions import ExtractYear, TruncMonth
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from oauth2_provider.contrib.rest_framework import permissions
from django.utils.timezone import now
from rest_framework import viewsets, generics, parsers, status, permissions, pagination, filters
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.mixins import UpdateModelMixin
from rest_framework.response import Response
from rest_framework.views import APIView
from cliniconlineapi import paginators, permission
from cliniconlineapi.serializers import userserializer, ChatBoxSerializer
from cliniconlineapi.models import User, Specialty, WorkDay, Appointment, TimeSlot, Medicine, MedicalRecord, TestResult, \
    Prescription, ServiceNormal,PrescriptionDetail, Test
from cliniconlineapi.serializers import userserializer, StaffSerializer
from cliniconlineapi.serializers.AppointmentSerializer import AppointmentSerializer, AppointmentDetailSerializer
from cliniconlineapi.serializers.ChatBoxSerializer import GeminiChatSerializer
from cliniconlineapi.serializers.MedicalRecordSerializer import MedicalRecordUpdateSerializer, \
    MedicalRecordCreateSerializer, MedicalRecordDetailSerializer, MedicalRecordListSerializer
from cliniconlineapi.serializers.MedicalSerializer import PrescriptionDetailedSerializer, PrescriptionCreateSerializer, \
    MedicineSerializer, PrescriptionUpdateSerializer
from cliniconlineapi.serializers.ServiceSerializer import ServiceNormalSerializer
from cliniconlineapi.serializers.TestResultSerializer import TestResultSerializer, TestResultCreateSerializer, \
    TestResultUpdateSerializer, TestResultBulkCreateSerializer, TestSerializer
from cliniconlineapi.serializers.userserializer import WorkDaySerializer, TimeSlotSerializer, SpecialtySerializer, \
    WorkDayLiteSerializer
from cliniconlineapi.serializers.StaffSerializer import DoctorSerializer
from cliniconlineapi.services.calculator_invoice import calculate_invoice_total
from cliniconlineapi.services.chatbox import get_cached_model
from cliniconlineapi.services.vnpay import create_vnpay_url
from cliniconlineapi.services.verifyVNPay import verify_vnpay_signature
from cliniconlineapi.services.firebase import send_push_to_user
from cliniconlineapi.services.ocrService import extract_text_from_image, parse_insurance_card
from cliniconlineapi.validators import MedicalRecordDataValidator, PrescriptionDataValidator, TestResultDataValidator

class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = userserializer.UserSerializer
    parser_classes = [parsers.JSONParser,
                    parsers.MultiPartParser]

    @action(methods=["GET", "PATCH"],
            url_path="profile_user",
            url_name="profile_user",
            detail=False,
            permission_classes=[permissions.IsAuthenticated])
    def profile_user(self,request):
        try:
            if request.user.role == User.Role.CUSTOMER:
                user = User.objects.select_related("customer_profile").get(id=request.user.id)
            if request.user.role in [User.Role.HEALTHCARE, User.Role.DOCTOR]:
                user = User.objects.select_related("staff_profile").prefetch_related(
                    "staff_profile__specialties"
                ).get(
                    id=request.user.id
                )
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.method == "GET":
            s = userserializer.UserDetailSerializer(user, context={"request": request})
            return Response(s.data, status=status.HTTP_200_OK)

        if request.method == "PATCH":
            instance = user
            profile_serializer = userserializer.UserDetailSerializer(
                instance, data=request.data, partial=True, context={"request": request}
            )
            profile_serializer.is_valid(raise_exception=True)
            profile_serializer.save()

            return Response(
                userserializer.UserDetailSerializer(user, context={"request": request}).data,
                status=status.HTTP_200_OK
            )

    @action(methods=["GET", "POST"],
            url_path="workday_staff",
            url_name="workday_staff",
            detail=False,
            permission_classes=[permission.IsStaffRole])
    def workday_staff(self, request):
        if request.method == "POST":
            s = WorkDaySerializer(data=request.data, context={"request": request})
            s.is_valid(raise_exception=True)
            c = s.save(staff_profile=request.user.staff_profile)
            return Response(WorkDaySerializer(c).data, status=status.HTTP_201_CREATED)
        else:
            month = request.query_params.get("month")
            querry = WorkDay.objects.filter(staff_profile = request.user.staff_profile)
            if month:
                year, mon = month.split("-")
                querry = querry.filter(date__year=year, date__month=mon)

            return Response(WorkDayLiteSerializer(querry, many=True).data, status=status.HTTP_200_OK)


    @action(
        methods=["GET", "DELETE"],
        url_path="workday/(?P<pk>[^/.]+)",
        url_name="workday-detail",
        detail=False,
        permission_classes=[permission.IsWorkdayOwner]
    )
    def workday_detail(self, request, pk=None):
        try:
            workday = WorkDay.objects.get(pk=pk, staff_profile=request.user.staff_profile)
        except WorkDay.DoesNotExist:
            return Response({"detail": "Không tìm thấy."}, status=status.HTTP_404_NOT_FOUND)

        if request.method == "GET":
            return Response(WorkDaySerializer(workday).data, status=status.HTTP_200_OK)

        if request.method == "DELETE":
            workday.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        methods=["PATCH"],
        url_path="workday/(?P<pk>[^/.]+)/timeslots",
        url_name="workday-timeslots",
        detail=False,
        permission_classes=[permission.IsWorkdayOwner]
    )
    def workday_timeslots(self, request, pk=None):
        try:
            workday = WorkDay.objects.get(pk=pk, staff_profile=request.user.staff_profile)
        except WorkDay.DoesNotExist:
            return Response({"detail": "Không tìm thấy."}, status=status.HTTP_404_NOT_FOUND)

        time_slots_data = request.data.get("time_slots", [])

        incoming_ids = set(
            s.get('id') for s in time_slots_data if s.get('id')
        )

        workday.time_slots.filter(
            appointment_time_slot__isnull=True
        ).exclude(
            id__in=incoming_ids
        ).delete()

        new_slots = [s for s in time_slots_data if not s.get('id')]

        if new_slots:
            serializer = TimeSlotSerializer(data=new_slots, many=True)
            serializer.is_valid(raise_exception=True)
            serializer.save(work_day=workday)

        return Response(WorkDaySerializer(workday).data, status=status.HTTP_200_OK)

class DoctorProfileViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    pagination_class = paginators.ItemPaginator

    def get_permissions(self):
        if self.action == "retrieve":
            return  [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return StaffSerializer.DoctorProfileSerializer
        return StaffSerializer.DoctorSerializer

    def get_queryset(self):
        query = User.objects.filter(
            role=User.Role.DOCTOR
        ).select_related("staff_profile").prefetch_related(
            "staff_profile__specialties"
        )

        q = self.request.GET.get("q", None)

        if q:
            query = query.filter(Q(first_name__icontains=q) | Q(last_name__icontains=q) | Q(staff_profile__specialties__name__icontains=q))

        return query

    @action(
        methods=["GET"],
        url_path="doctor_workday",
        url_name="doctor_workday",
        detail=True,
        permission_classes=[permissions.IsAuthenticated]
    )
    def doctor_workday(self, request, pk):
        if request.method == "GET":
            W = WorkDay.objects.filter(staff_profile__user=pk).prefetch_related("time_slots")
            return Response(WorkDaySerializer(W, many=True).data, status=status.HTTP_200_OK)

class AppointmentViewSet(viewsets.ViewSet,
                         generics.CreateAPIView,
                         generics.ListAPIView,
                         generics.RetrieveAPIView,
                         generics.DestroyAPIView,
                         UpdateModelMixin):
    queryset = Appointment.objects.filter(active=True)
    serializer_class = AppointmentSerializer
    permission_classes = [permission.IsAppointmentOwner]
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_permissions(self):
        if self.action == 'create':
            return [permission.IsCustomerRole()]
        if self.action == 'partial_update':
            return [permission.IsDoctorAndAppointmentOwner()]
        if self.action == 'destroy':
            return [permission.IsCustomerAndAppointmentOwner()]
        if self.action in ['vnpay_return', 'vnpay_create']:  #
            return [permissions.AllowAny()]
        return [permission.IsAppointmentOwner()]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return AppointmentDetailSerializer
        return AppointmentSerializer

    def get_queryset(self):
        user = self.request.user

        if self.action == "retrieve":
            return Appointment.objects.select_related("customer", "doctor").filter(
                active=True
            )

        if user.role == "customer":
            return self.queryset.filter(customer=user)
        elif user.role == "doctor":
            return self.queryset.filter(doctor=user)

        return self.queryset.none()

    def perform_update(self, serializer):
        instance = self.get_object()
        allowed_statuses = [
            Appointment.Status.PENDING,
            Appointment.Status.CONFIRMED
        ]
        if instance.status not in allowed_statuses:
            raise ValidationError(
                "Chỉ có thể cập nhật lịch hẹn đang chờ xác nhận hoặc đã xác nhận."
            )

        updated = serializer.save()

        # if updated.status == Appointment.Status.CANCELED:
        #     updated.time_slot.status = TimeSlot.Status.AVAILABLE
        #     updated.time_slot.save()
        #
        #     send_push_to_user(
        #         user_id=updated.customer.id,
        #         title='Lịch hẹn bị từ chối',
        #         body=f'Bác sĩ {updated.doctor.last_name} {updated.doctor.first_name} đã từ chối lịch hẹn của bạn.',
        #         data={'type': 'appointment', 'id': str(updated.id),'sub_type': 'canceled'}
        #     )
        #
        # elif updated.status == Appointment.Status.CONFIRMED:
        #     send_push_to_user(
        #         user_id=updated.customer.id,
        #         title='Lịch hẹn được xác nhận',
        #         body=f'Bác sĩ {updated.doctor.last_name} {updated.doctor.first_name} đã xác nhận lịch hẹn của bạn.',
        #         data={'type': 'appointment', 'id': str(updated.id), 'sub_type': 'confirmed'}
        #     )
        #
        # elif updated.status == Appointment.Status.PENDING_PAYMENT:
        #     print("Hóa đơn đã sẳn sàng chờ bạn thanh toán")
        #     send_push_to_user(
        #         user_id=updated.customer.id,
        #         title='Hóa đơn đã sẳn sàng chờ bạn thanh toán',
        #         body=f'Bác sĩ {updated.doctor.last_name} {updated.doctor.first_name} đã xác nh của bạn.',
        #         data={'type': 'appointment', 'id': str(updated.id), 'sub_type': 'pending_payment'}
        #     )


    def perform_destroy(self, instance):

        if instance.status not in [Appointment.Status.PENDING, Appointment.Status.CANCELED]:
            raise ValidationError("Chỉ có thể xóa lịch hẹn đang chờ xác nhận hoặc từ chối.")

        if instance.status == Appointment.Status.PENDING and now() - instance.created_date > timedelta(hours=24):
            raise ValidationError("Không thể xóa lịch hẹn sau 24 giờ kể từ khi đặt.")

        instance.time_slot.status = TimeSlot.Status.AVAILABLE
        instance.time_slot.save()
        instance.delete()


    @action(methods=["GET"],detail=True,url_path="invoice",url_name="invoice")
    def invoice(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        data = calculate_invoice_total(appointment)
        prescription_items = []
        try:
            for d in appointment.medical_record.prescription.details.select_related('medicine').all():
                prescription_items.append({
                    "name": d.medicine.name,
                    "unit": d.medicine.unit,
                    "quantity": d.quantity,
                    "unit_price": d.unit_price,
                    "total": d.quantity * d.unit_price,
                })
        except:
            pass
        test_items = []
        try:
            for t in appointment.medical_record.test_results.select_related('test').all():
                test_items.append({
                    "name": t.test.name,
                    "price": t.test.price or 0,
                })
        except:
            pass
        return Response({
            "appointment_id": appointment.id,
            "service": {
                "name": appointment.serviceNormal.name if appointment.serviceNormal else None,
                "fee": data["service_fee"],
            },
            "doctor": {
                "name": appointment.doctor.get_full_name(),
                "fee": data["doctor_fee"],
            },
            "prescription": {
                "items": prescription_items,
                "fee": data["medicine_fee"],
            },
            "tests": {
                "items": test_items,
                "fee": data["test_fee"],
            },
            "status": appointment.status,
            "total": data["total"],
        })

    @action(methods=["POST"], detail=True, url_path="vnpay/create")
    def vnpay_create(self, request, pk):
        appointment = get_object_or_404(Appointment, pk=pk)
        data = calculate_invoice_total(appointment)
        txn_ref = f"{appointment.id}_{int(time.time())}"
        payment_url = create_vnpay_url(
            order_id=txn_ref,
            amount=data["total"],
            order_info=f"Thanh toan lich hen #{appointment.id}",
            ip_addr=request.META.get("REMOTE_ADDR", "127.0.0.1")
        )
        return Response({"payment_url": payment_url})

    @action(methods=["GET"], detail=False, url_path="vnpay/return",permission_classes=[permissions.AllowAny])
    def vnpay_return(self, request):
        params = request.GET.dict()
        if not verify_vnpay_signature(params):
            from django.http import HttpResponse
            return HttpResponse("""
                   <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                                       background: #f5f5f5; display: flex; align-items: center;
                                       justify-content: center; min-height: 100vh; }
                                .card { background: white; border-radius: 20px; padding: 40px;
                                        text-align: center; max-width: 360px; width: 90%;
                                        box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                                .icon { font-size: 64px; margin-bottom: 16px; }
                                h2 { color: #C62828; font-size: 22px; margin-bottom: 8px; }
                                p { color: #757575; font-size: 14px; }
                            </style>
                        </head>
                        <body>
                            <div class="card">
                                <div class="icon">🔒</div>
                                <h2>Chữ ký không hợp lệ</h2>
                                <p>Giao dịch không thể xác thực.</p>
                            </div>
                        </body>
                   </html>
                """, status=400)

        vnp_response_code = request.GET.get("vnp_ResponseCode")
        vnp_txn_ref = request.GET.get("vnp_TxnRef")
        appointment_id = vnp_txn_ref.split("_")[0]

        if vnp_response_code == "00":
            appointment = get_object_or_404(Appointment, pk=appointment_id)
            appointment.status = Appointment.Status.COMPLETED
            appointment.save()
            from django.http import HttpResponse
            response = HttpResponse(f"""
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <style>
                                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                                        background: linear-gradient(135deg, #E8F5E9, #F1F8E9);
                                        display: flex; align-items: center;
                                        justify-content: center; min-height: 100vh; }}
                                .card {{ background: white; border-radius: 20px; padding: 40px;
                                         text-align: center; max-width: 360px; width: 90%;
                                         box-shadow: 0 4px 20px rgba(0,0,0,0.1); }}
                                .icon {{ font-size: 72px; margin-bottom: 16px; }}
                                h2 {{ color: #2E7D32; font-size: 24px; margin-bottom: 8px; font-weight: 700; }}
                                .amount {{ color: #1B5E20; font-size: 28px; font-weight: 800;
                                           margin: 16px 0; }}
                                p {{ color: #757575; font-size: 14px; margin-bottom: 8px; }}
                                .badge {{ background: #E8F5E9; color: #2E7D32; padding: 6px 16px;
                                          border-radius: 20px; font-size: 13px; font-weight: 600;
                                          display: inline-block; margin-top: 8px; }}
                                .redirect {{ color: #BDBDBD; font-size: 12px; margin-top: 20px; }}
                                .bar {{ height: 4px; background: #E8F5E9; border-radius: 2px;
                                        margin-top: 12px; overflow: hidden; }}
                                .bar-fill {{ height: 100%; background: #2E7D32; border-radius: 2px;
                                             animation: fill 2s linear forwards; }}
                                @keyframes fill {{ from {{ width: 0%; }} to {{ width: 100%; }} }}
                            </style>
                        </head>
                        <body>
                            <div class="card">
                                <div class="icon">✅</div>
                                <h2>Thanh toán thành công!</h2>
                                <div class="badge">Mã lịch hẹn #{appointment_id}</div>
                                <p style="margin-top:20px">Cảm ơn bạn đã sử dụng dịch vụ.</p>
                                <p class="redirect">Đang chuyển về ứng dụng...</p>
                                <div class="bar"><div class="bar-fill"></div></div>
                            </div>
                            <script>
                                setTimeout(() => {{
                                    window.location.href = "myapp://payment/success?appointmentId={appointment_id}";
                                }}, 2000);
                            </script>
                        </body>
                        </html>
                    """)
            response["ngrok-skip-browser-warning"] = "true"
            return response


        from django.http import HttpResponse
        response = HttpResponse("""
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                               background: linear-gradient(135deg, #FFEBEE, #FFF3F3);
                               display: flex; align-items: center;
                               justify-content: center; min-height: 100vh; }
                        .card { background: white; border-radius: 20px; padding: 40px;
                                text-align: center; max-width: 360px; width: 90%;
                                box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                        .icon { font-size: 72px; margin-bottom: 16px; }
                        h2 { color: #C62828; font-size: 24px; margin-bottom: 8px; font-weight: 700; }
                        p { color: #757575; font-size: 14px; margin-bottom: 8px; }
                        .redirect { color: #BDBDBD; font-size: 12px; margin-top: 20px; }
                        .bar { height: 4px; background: #FFEBEE; border-radius: 2px;
                               margin-top: 12px; overflow: hidden; }
                        .bar-fill { height: 100%; background: #C62828; border-radius: 2px;
                                    animation: fill 2s linear forwards; }
                        @keyframes fill { from { width: 0%; } to { width: 100%; } }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="icon">❌</div>
                        <h2>Thanh toán thất bại!</h2>
                        <p>Giao dịch không thành công.</p>
                        <p>Vui lòng quay lại ứng dụng và thử lại.</p>
                        <p class="redirect">Đang chuyển về ứng dụng...</p>
                        <div class="bar"><div class="bar-fill"></div></div>
                    </div>
                    <script>
                        setTimeout(() => {
                            window.location.href = "myapp://payment/failed";
                        }, 2000);
                    </script>
                </body>
                </html>
            """)
        response["ngrok-skip-browser-warning"] = "true"
        return response

class SpecialtyViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Specialty.objects.filter(active=True)
    serializer_class = SpecialtySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.SpecialtyPaninator

    @action(methods=["GET"],
            url_path="doctors",
            url_name="doctors",
            detail=True,
            permission_classes=[permissions.IsAuthenticated],
            pagination_class = paginators.SpecialtyPaninator)
    def specialty_doctors(self, request,pk=None):
        q = User.objects.select_related('staff_profile').filter(
            role=User.Role.DOCTOR,
            staff_profile__specialties__id=pk
        ).select_related('staff_profile')
        return Response(DoctorSerializer(q, many=True).data, status=status.HTTP_200_OK)

    def get_queryset(self):
        query = Specialty.objects.filter(active=True)

        q = self.request.GET.get("q", None)

        if q:
            query = query.filter(Q(name__icontains=q))

        return query

class ServiceNormalViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = ServiceNormal.objects.all()
    serializer_class = ServiceNormalSerializer
    permission_classes = [permissions.IsAuthenticated]

class GeminiChatViewSet(viewsets.ViewSet, generics.CreateAPIView):

    permission_classes = [permissions.IsAuthenticated]

    serializer_class = GeminiChatSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.validated_data["message"]
        try:
            response = get_cached_model().generate_content(message)
            return Response({"reply": response.text})

        except Exception as e:
            return Response({"error": str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InsuranceCardOCRView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        image_file = request.FILES.get("image")
        if not image_file:
            return Response(
                {"error": "Vui lòng upload ảnh thẻ bảo hiểm"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra định dạng
        allowed_types = ["image/jpeg", "image/png", "image/jpg"]
        if image_file.content_type not in allowed_types:
            return Response(
                {"error": "Chỉ hỗ trợ JPG, PNG"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            image_bytes = image_file.read()
            raw_text = extract_text_from_image(image_bytes)
            parsed = parse_insurance_card(raw_text)

            return Response({
                "raw_text": raw_text,
                "data": parsed
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MedicineViewSet(viewsets.ViewSet,generics.ListCreateAPIView,generics.RetrieveAPIView):
    serializer_class = MedicineSerializer
    pagination_class = paginators.MedicinePaninator
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    search_fields = ["name","description"]
    ordering_fields = ["name"]

    def get_permissions(self):
        if self.action in ['create', 'partial_update',]:
            return [permission.IsHealthcareRole()]

        return [permission.IsStaffRole()]

    def get_queryset(self):
        queryset = Medicine.objects.all()
        filter_key = self.request.query_params.get('filter')

        if filter_key== 'all':
            queryset = Medicine.objects.filter(active=True)

        if filter_key == 'low_stock':
            queryset = queryset.filter(stock__lt=50)
        elif filter_key == 'expiring_soon':
            threshold = date.today() + timedelta(days=30)
            queryset = queryset.filter(expiry_date__lte=threshold)
        elif filter_key == 'expired':
            queryset = queryset.filter(expiry_date__lt=date.today())
        elif filter_key == 'inactive':
            queryset = Medicine.objects.filter(active=False)

        return queryset

    def paginate_queryset(self,queryset):
        if (self.request.query_params.get('search') or
            self.request.query_params.get('filter')):
            return None
        return super().paginate_queryset(queryset)


    # def create(self,request, *args, **kwargs):
    #     s = MedicineSerializer(data=request.data)
    #     s.is_valid(raise_exception=True)
    #     s.save()
    #     return Response(s.data,status=status.HTTP_201_CREATED)


    def partial_update(self,request,pk=None, *args, **kwargs):
        medicine = get_object_or_404(Medicine, pk=pk)
        s = MedicineSerializer(medicine,data=request.data,partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data, status=status.HTTP_200_OK)

class PrescriptionViewSet(viewsets.ViewSet, generics.ListCreateAPIView):
    queryset = Prescription.objects.filter(active=True)
    serializer_class = PrescriptionDetailedSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return PrescriptionCreateSerializer
        if self.action == 'update':
            return PrescriptionUpdateSerializer
        return PrescriptionDetailedSerializer

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset.select_related(
            'medical_record__appointment__customer',
            'medical_record__appointment__doctor'
        )
        # Doctor
        if user.role == "doctor":
            return qs.filter(medical_record__appointment__doctor=user)
        # Customer
        elif user.role == "customer":
            return qs.filter(medical_record__appointment__customer=user)
        return qs.none()

    def create(self,request, *args, **kwargs):
        serializer = PrescriptionCreateSerializer(data=request.data,context={'request': request})
        serializer.is_valid(raise_exception=True)
        prescription = serializer.save()
        return Response(
                PrescriptionDetailedSerializer(prescription).data,
                status=status.HTTP_201_CREATED
                )

    def partial_update(self, request, pk=None):
        prescription = get_object_or_404(Prescription, pk=pk, active=True)

        # Validate permission
        validator = PrescriptionDataValidator()
        validator.validate_update_permission(prescription, request.user)

        serializer = PrescriptionUpdateSerializer(
            prescription,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        prescription.refresh_from_db()
        return Response(
            PrescriptionDetailedSerializer(prescription).data,
            status=status.HTTP_200_OK
        )

#Kết quả xét nghiệm
class TestViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Test.objects.filter(active=True)
    serializer_class = TestSerializer
    permission_classes = [permission.IsAuthenticated]
    filter_backends = (filters.SearchFilter,filters.OrderingFilter)
    search_fields = ["name"]
    ordering_fields = ["name"]

    def get_queryset(self):
        return self.queryset

    def get_permissions(self):
        return [permission.IsStaffRole()]


class TestResultViewSet(viewsets.ModelViewSet):
    queryset = TestResult.objects.select_related('test', 'medical_record')
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TestResultSerializer
    http_method_names = ['get', 'post', 'patch', 'delete']

    def get_serializer_class(self):
        if self.action == 'create':
            return TestResultCreateSerializer
        if self.action == 'partial_update':
            return TestResultUpdateSerializer
        return TestResultSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permission.IsDoctorAndTestResultOwner()]

        return [permission.IsDoctorRole()]


    def get_queryset(self):
        user = self.request.user
        qs = self.queryset.select_related(
            'test',
            'medical_record__appointment__customer',
            'medical_record__appointment__doctor'
        )
        if user.role == "doctor":
            return qs.filter(medical_record__appointment__doctor=user)
        elif user.role == "customer":
            return qs.filter(medical_record__appointment__customer=user)
        return qs.none()

    def list(self,request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = TestResultSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self,request, *args, **kwargs):
        serializer = TestResultBulkCreateSerializer(data=request.data,context={'request': request})
        serializer.is_valid(raise_exception=True)
        testresults = serializer.save()
        return Response(
            TestResultSerializer(testresults,many=True).data,
            status=status.HTTP_201_CREATED
        )

    def partial_update(self, request, pk=None, *args, **kwargs):
        test_result = get_object_or_404(TestResult, pk=pk, active=True)

        validator = TestResultDataValidator()
        validator.validate_update_permission(test_result, request.user)

        serializer = TestResultUpdateSerializer(
            test_result,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            TestResultSerializer(test_result).data,
            status=status.HTTP_200_OK
        )

    def destroy(self, request, pk=None, *args, **kwargs):
        test_result = get_object_or_404(TestResult, pk=pk, active=True)

        validator = TestResultDataValidator()
        validator.validate_update_permission(test_result, request.user)

        test_result.delete()
        return Response(
            {'message': 'Xóa kết quả xét nghiệm thành công'},
            status=status.HTTP_204_NO_CONTENT
        )

#Bệnh án
class MedicalRecordViewSet(viewsets.ViewSet, generics.ListCreateAPIView, generics.RetrieveAPIView):
    queryset = MedicalRecord.objects.filter(active=True)
    serializer_class = MedicalRecordListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            return [permission.IsDoctorAndMedicalRecordOwner()]

        return [permission.IsOwner()]

    def get_queryset(self):
        user = self.request.user
        qs = (self.queryset.select_related(
                'appointment__customer',
                'appointment__doctor'
                ).prefetch_related('prescription','test_results'))
        # Bác sĩ chỉ thấy bệnh án của mình
        if user.role == "doctor":
            return qs.filter(appointment__doctor=user)
        # Customer chỉ thấy bệnh án của mình
        elif user.role == "customer":
            return qs.filter(appointment__customer=user)

        return qs.none()

    def list(self, request,*args, **kwargs):
        queryset = self.get_queryset()
        serializer = MedicalRecordListSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request,*args, **kwargs):
        serializer = MedicalRecordCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            medical_record = serializer.save()
            return Response(
                MedicalRecordDetailSerializer(
                    medical_record,
                    context={'request': request}
                ).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk):
        medical_record = get_object_or_404(
            MedicalRecord.objects.prefetch_related(
                'test_results',
                'prescription__details__medicine',
            ).select_related(
                'appointment__customer',
                'appointment__doctor',
            ),
            pk=pk,
            active=True
        )
        return Response(
            MedicalRecordDetailSerializer(medical_record).data,
            status=status.HTTP_200_OK
        )


    def partial_update(self, request, pk):
        medical_record = get_object_or_404(MedicalRecord, pk=pk, active=True)

        validator = MedicalRecordDataValidator()
        validator.validate_update_permission(medical_record,request.user)

        serializer = MedicalRecordUpdateSerializer(
            medical_record,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class TotalStatView(APIView):
    permission_classes = [permission.IsAdminRole]

    def get(self, request):
        stat_type = request.query_params.get('type')

        if stat_type == 'age':
            return Response(self.get_age())
        elif stat_type == 'gender':
            return Response(self.get_gender())
        elif stat_type == 'specialty':
            return Response(self.get_specialty())
        elif stat_type == 'serviceNormal':
            return Response(self.get_serviceNormal())
        elif stat_type == 'totalSales':
            return Response(self.get_totalSales(request))
        return Response({'error': 'type không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

    def get_age(self):
        current_year = now().year
        return list(User.objects.filter(
            role='customer',
            is_active=True,
            dob__isnull=False
        ).annotate(
            age=current_year - ExtractYear('dob'),
            age_group=Case(
                When(age__lte=18, then=Value('0-18')),
                When(age__range=(19, 30), then=Value('19-30')),
                When(age__range=(31, 50), then=Value('31-50')),
                default=Value('50+'),
                output_field=CharField()
            )
        ).values('age_group').annotate(
            completed_appointments=Count(
                'appointments_customer',
                filter=Q(appointments_customer__status=Appointment.Status.COMPLETED)
            )
        ).order_by('age_group'))

    def get_gender(self):
        return list(User.objects.filter(
            role='customer',
            is_active=True
        ).values('gender').annotate(
            completed_appointments=Count(
                'appointments_customer',
                filter=Q(appointments_customer__status=Appointment.Status.COMPLETED)
            )
        ).order_by('gender'))

    def get_specialty(self):
        return list(Specialty.objects.annotate(
        completed_appointments=Count(
            'staffspecialty__staff__user__appointments_doctor',
            filter=Q(
                staffspecialty__staff__user__appointments_doctor__status=Appointment.Status.COMPLETED
            ),
            distinct=True
        )
    ).values('name', 'completed_appointments').order_by('name'))

    def get_serviceNormal(self):
        return list(ServiceNormal.objects.filter(
            active = True
        ).values('name').annotate(
              completed_appointments=Count(
                  'appointments_serviceNormal',
                  filter=Q(appointments_serviceNormal__status=Appointment.Status.COMPLETED),
              )
        ).order_by('name'))

    def get_totalSales(self, request):
        from django.utils.timezone import make_aware
        from datetime import datetime

        start = request.query_params.get('start')
        end = request.query_params.get('end')

        start_date = make_aware(datetime.strptime(start, '%Y-%m-%d')) if start else make_aware(
            datetime(now().year, 1, 1))
        end_date = make_aware(datetime.strptime(end, '%Y-%m-%d')) if end else make_aware(datetime(now().year, 12, 31))

        result = Appointment.objects.filter(
            status=Appointment.Status.COMPLETED,
            created_date__gte=start_date,
            created_date__lte=end_date
        ).annotate(
            month=TruncMonth('created_date')
        ).values('month').annotate(
            service_revenue=Sum('serviceNormal__price'),
            doctor_revenue=Sum('doctor__staff_profile__price'),
            medicine_revenue=Sum(
                F('medical_record__prescription__details__unit_price') *
                F('medical_record__prescription__details__quantity')
            ),
            test_revenue=Sum('medical_record__test_results__test__price'),
        ).order_by('month')

        return [
            {
                'month': f"T{item['month'].month}/{item['month'].year}",
                'total': (item['service_revenue'] or 0) +
                         (item['doctor_revenue'] or 0) +
                         (item['medicine_revenue'] or 0) +
                         (item['test_revenue'] or 0),
            }
            for item in result
        ]
