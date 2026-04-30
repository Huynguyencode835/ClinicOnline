from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated

from cliniconlineapi.models import Appointment, TimeSlot
from cliniconlineapi.serializers.ServiceNormalSerializer import ServiceNormalSerializer
from cliniconlineapi.serializers.userserializer import TimeSlotDetailSerializer, UserSerializer, UserDetailSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['id', 'customer', 'doctor', 'time_slot',
                  'reason','symptoms', 'serviceNormal','status']
        extra_kwargs = {
            'status': {
                'read_only':True
            }
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)

        request = self.context.get("request")
        user = request.user if request else None

        if user and user.role == "doctor":
            data["customer"] = UserSerializer(instance.customer).data
        else:
            data["doctor"] = UserSerializer(instance.doctor).data

        data["time_slot"] = TimeSlotDetailSerializer(instance.time_slot).data
        data["serviceNormal"] = ServiceNormalSerializer(instance.serviceNormal).data

        return data

class AppointmentDetailSerializer(AppointmentSerializer):
    class Meta:
        model = Appointment
        fields = AppointmentSerializer.Meta.fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["customer"] = UserDetailSerializer(instance.customer).data
        data["doctor"] = UserSerializer(instance.doctor).data
        return data

