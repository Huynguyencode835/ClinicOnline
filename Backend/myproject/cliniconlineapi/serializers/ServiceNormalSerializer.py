from rest_framework import serializers
from cliniconlineapi.models import ServiceNormal


class ServiceNormalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceNormal
        fields = ['id','name']

class ServiceDetailSerializer(ServiceNormalSerializer):
    class Meta:
        model = ServiceNormalSerializer.Meta.model
        fields = ServiceNormalSerializer.Meta.fields + ['description']