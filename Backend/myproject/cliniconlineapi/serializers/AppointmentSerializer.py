from rest_framework import serializers

from cliniconlineapi.models import Appointment, TimeSlot
from cliniconlineapi.serializers.userserializer import UserSerializer, CustomerProfileSerializer, TimeSlotSerializer


class AppointmentSerializer(serializers.ModelSerializer):
    customer_info = CustomerProfileSerializer(source='customer', read_only=True)
    time_slot_info = TimeSlotSerializer(source='timeslot', read_only=True)
    time_slot_id = serializers.PrimaryKeyRelatedField(
        queryset=TimeSlot.objects.filter(status=TimeSlot.Status.AVAILABLE),
        source='time_slot',
        write_only=True
    )
    class Meta:
        model = Appointment
        fields = ['id', 'customer_info', 'time_slot_info', 'time_slot_id',
                  'reason', 'status', 'created_date']

class AppointmentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['status']