import cloudinary.uploader

from cliniconlineapi.models import User, CustomerProfile, StaffProfile


def save_avatar(backend, user, response, *args, **kwargs):
    if not user:
        return

    if backend.name == 'google-oauth2':
        avatar_url = response.get('picture')

        if avatar_url:
            result = cloudinary.uploader.upload(avatar_url)
            user.avatar = result['public_id']
            user.save()

def save_profile(backend, user, response, *args, **kwargs):
    if not user:
        return
    if user.role == User.Role.CUSTOMER:
        CustomerProfile.objects.get_or_create(user=user)
    elif user.role in [User.Role.DOCTOR, User.Role.HEALTHCARE]:
        StaffProfile.objects.get_or_create(user=user)
    user.save()
