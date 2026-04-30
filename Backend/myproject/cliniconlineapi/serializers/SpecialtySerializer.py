from rest_framework import serializers

from cliniconlineapi.models import Specialty


class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ['id','name']
        