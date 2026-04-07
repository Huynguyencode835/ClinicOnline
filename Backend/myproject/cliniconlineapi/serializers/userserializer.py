from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from cliniconlineapi.models import User, StaffProfile, CustomerProfile, Specialty, StaffSpecialty
from cliniconlineapi.validators import NameValidator, PhoneNumberValidator, MaxLengthValidator


class UserNormalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'avatar', 'phone', 'email']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNormalSerializer.Meta.model
        fields = UserNormalSerializer.Meta.fields + ['username', 'password','gender', 'role']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.avatar:
            data['avatar'] = instance.avatar.url
        return data

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(user.password)
        user.save()
        if user.role in [User.Role.DOCTOR, User.Role.HEALTHCARE]:
            StaffProfile.objects.create(user=user)
        elif user.role == User.Role.CUSTOMER:
            CustomerProfile.objects.create(user=user)
        return user

class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ["id", "name", "description"]

class StaffProfileSerializer(serializers.ModelSerializer):
    user = UserNormalSerializer(read_only=True)
    specialties = SpecialtySerializer(many=True, read_only=True)
    class Meta:
        model = StaffProfile
        fields = ["id","user" ,"specialties", "degree", "experience", "bio"]

    def validate_experience(self, value):
        if value:
            if value > 98:
                raise ValidationError("ko dược lớn hơn 98")
            elif value < 2:
                raise ValidationError("ko dược nhỏ hơn 1")
        return value

class CustomerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = CustomerProfile
        fields = ["user", "id", "height", "weight"]


