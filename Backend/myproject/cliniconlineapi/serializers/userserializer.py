from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from cliniconlineapi.models import User, StaffProfile, CustomerProfile, Specialty, StaffSpecialty, WorkDay, TimeSlot
from cliniconlineapi.validators import NameValidator, PhoneNumberValidator, MaxLengthValidator


class UserSerializer(serializers.ModelSerializer):
    profile = serializers.DictField(write_only=True, required=False)
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'avatar', 'phone', 'email','username', 'password','gender', 'role','profile']
        extra_kwargs = {
            'password': {
                'write_only': True,
            },
            'username': {
                'write_only': True,
            },
            'role': {
                'write_only': True,
            }
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            data['avatar'] = instance.avatar.url

        try:
            if instance.role == User.Role.CUSTOMER:
                data["profile"] = CustomerProfileSerializer(instance.customer_profile).data
            elif instance.role in [User.Role.DOCTOR, User.Role.HEALTHCARE]:
                data["profile"] = StaffProfileSerializer(instance.staff_profile).data
            else:
                # Admin hoặc superuser không có profile
                data["profile"] = None
        except Exception as e:
            print(f"Profile error: {e}")
            data["profile"] = None

        return data

    def validate_phone(self, value):
        if value: PhoneNumberValidator()(value)
        return value

    def validate_first_name(self, value):
        if value: NameValidator(2,10)(value)
        return value

    def validate_last_name(self, value):
        if value:
            NameValidator(2,10)(value)
        return value

    def validate_role(self, value):
        request = self.context.get("request")
        user = request.user if request else None
        if value != User.Role.CUSTOMER:
            if not (user and user.is_staff):
                raise serializers.ValidationError("Chỉ admin mới có thể gán quyền này.")
        return value

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        user = User(**validated_data)
        user.set_password(user.password)
        user.save()
        if user.role in [User.Role.DOCTOR, User.Role.HEALTHCARE]:
            StaffProfile.objects.create(user=user)
        elif user.role == User.Role.CUSTOMER:
            CustomerProfile.objects.create(
                user=user,
                height=profile_data.get('height'),
                weight=profile_data.get('weight')
            )
        return user

class UserDetailSerializer(UserSerializer):
    class Meta:
        model = UserSerializer.Meta.model
        fields = UserSerializer.Meta.fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.role == User.Role.CUSTOMER:
            data["profile"] = CustomerProfileSerializer(instance.customerprofile).data
        else:
            data["profile"] = StaffProfileDetailSerializer(instance.staffprofile).data
        return data

class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ["id", "name", "description"]

# chưa validate
class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ["id", "status", "start_time", "end_time"]

    def validate(self, attrs):
        if attrs["start_time"] >= attrs["end_time"]:
            raise serializers.ValidationError("start_time phải nhỏ hơn end_time.")
        return attrs

class WorkDayLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkDay
        fields = ["id", "day_of_week"]

# chưa validate
class WorkDaySerializer(serializers.ModelSerializer):
    time_slots = TimeSlotSerializer(many=True)
    class Meta:
        model = WorkDayLiteSerializer.Meta.model
        fields = WorkDayLiteSerializer.Meta.fields+['timeslot_set']

    def create(self, validated_data):
        time_slots_data = validated_data.pop("time_slots", [])
        workday = WorkDay(**validated_data)
        workday.save()
        for slot in time_slots_data:
            TimeSlot.objects.create(work_day=workday, **slot)
        return workday

class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = ["id", "specialties", "degree", "experience", "bio"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["workday_set"] = WorkDayLiteSerializer(instance.workday_set.all(), many=True).data
        data["specialties"] = SpecialtySerializer(instance.specialties.all(), many=True).data
        return data

    def validate_experience(self, value):
        if value:
            if value > 98:
                raise ValidationError("ko dược lớn hơn 98")
            elif value < 2:
                raise ValidationError("ko dược nhỏ hơn 1")
        return value

class StaffProfileDetailSerializer(StaffProfileSerializer):
    class Meta:
        model = StaffProfileSerializer.Meta.model
        fields = StaffProfileSerializer.Meta.fields

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["workday_set"] = WorkDaySerializer(instance.workday_set.all(), many=True).data
        return data

# chưa validate
class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ["height", "weight"]








