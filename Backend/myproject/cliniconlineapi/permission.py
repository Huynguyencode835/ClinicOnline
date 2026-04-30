from rest_framework.permissions import BasePermission, IsAuthenticated
from cliniconlineapi.models import User


class IsStaffRole(IsAuthenticated):
    def has_permission(self, request, view):
        return (
            super().has_permission(request, view) and
            request.user.role in [User.Role.DOCTOR, User.Role.HEALTHCARE]
        )

class IsCustomerRole(IsAuthenticated):
    def has_permission(self, request, view):
        return (
            super().has_permission(request, view) and
            request.user.role == User.Role.CUSTOMER
        )

class IsDoctorRole(IsAuthenticated):
    def has_permission(self, request, view):
        return (
                super().has_permission(request, view) and
                request.user.role == User.Role.DOCTOR
        )

class IsHealthcareRole(IsAuthenticated):
    def has_permission(self, request, view):
        return (
                super().has_permission(request, view) and
                request.user.role == User.Role.HEALTHCARE
        )

class IsAppointmentOwner(IsAuthenticated):
    def has_object_permission(self, request, view, Appointment):
        return (
                super().has_permission(request, view) and
                request.user == Appointment.user
        )
