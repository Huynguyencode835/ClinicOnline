import random

import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from cliniconlineapi.models import User, StaffProfile, Specialty

specialties_data = [
    {"name": "Nội tổng quát", "description": "Khám và điều trị các bệnh nội khoa tổng quát"},
    {"name": "Ngoại tổng quát", "description": "Phẫu thuật các bệnh lý ngoại khoa"},
    {"name": "Tim mạch", "description": "Chẩn đoán và điều trị bệnh tim và mạch máu"},
    {"name": "Thần kinh", "description": "Điều trị các bệnh về não và hệ thần kinh"},
    {"name": "Chấn thương chỉnh hình", "description": "Điều trị gãy xương, khớp và cơ"},
    {"name": "Sản phụ khoa", "description": "Chăm sóc sức khỏe phụ nữ và thai sản"},
    {"name": "Nhi khoa", "description": "Khám và điều trị cho trẻ em"},
    {"name": "Da liễu", "description": "Điều trị các bệnh về da"},
    {"name": "Tai mũi họng", "description": "Điều trị bệnh tai, mũi, họng"},
    {"name": "Răng hàm mặt", "description": "Chăm sóc và điều trị răng miệng"},
    {"name": "Mắt", "description": "Khám và điều trị các bệnh về mắt"},
    {"name": "Hô hấp", "description": "Điều trị bệnh phổi và đường hô hấp"},
    {"name": "Tiêu hóa", "description": "Điều trị bệnh dạ dày, ruột"},
    {"name": "Nội tiết", "description": "Điều trị các bệnh về hormone và tuyến nội tiết"},
    {"name": "Thận - tiết niệu", "description": "Điều trị các bệnh về thận và đường tiết niệu"},
    {"name": "Ung bướu", "description": "Chẩn đoán và điều trị ung thư"},
    {"name": "Huyết học", "description": "Điều trị các bệnh về máu"},
    {"name": "Truyền nhiễm", "description": "Điều trị các bệnh lây nhiễm"},
    {"name": "Y học cổ truyền", "description": "Điều trị bằng phương pháp đông y"},
    {"name": "Phục hồi chức năng", "description": "Vật lý trị liệu và phục hồi chức năng"},
    {"name": "Hồi sức cấp cứu", "description": "Cấp cứu và điều trị bệnh nhân nặng"},
    {"name": "Gây mê hồi sức", "description": "Gây mê và theo dõi phẫu thuật"},
    {"name": "Dinh dưỡng", "description": "Tư vấn chế độ ăn và dinh dưỡng"},
]

for s in specialties_data:
    Specialty.objects.get_or_create(name=s["name"], defaults={"description": s["description"]})
    print(f"✅ Specialty: {s['name']}")

specialties = list(Specialty.objects.all())
alphabet = [chr(i) for i in range(ord('A'), ord('U'))]
degrees = ["BS", "CKII", "CKI", "ThS", "PGS.TS"]
genders = ["male", "female", "other"]

# Mỗi bác sĩ gán 2-3 chuyên khoa theo pattern cố định (không random để chạy lại không đổi)
def get_specialties_for_doctor(i, specialties):
    count = (i % 2) + 2  # 2 hoặc 3 chuyên khoa
    return [specialties[(i + j) % len(specialties)] for j in range(count)]

for i, letter in enumerate(alphabet):
    username = f"nguyenvan{letter.lower()}{i+1}"
    user, created = User.objects.get_or_create(username=username)

    if created:
        user.set_password("Doctor@123")
        user.first_name = letter
        user.last_name = "Nguyễn Văn"
        user.phone = f"09{str(i).zfill(2)}111{str(i).zfill(3)}"
        user.email = f"bsnguyenvan{letter.lower()}@gmail.com"
        user.role = User.Role.DOCTOR
        user.gender = genders[i % len(genders)]
        user.save()

        doctor_specialties = get_specialties_for_doctor(i, specialties)
        experience = (i % 20) + 2
        specialty_names = ", ".join([s.name for s in doctor_specialties])

        profile = StaffProfile.objects.create(
            user=user,
            degree=degrees[i % len(degrees)],
            experience=experience,
            bio=f"Bác sĩ Nguyễn Văn {letter} có {experience} năm kinh nghiệm trong lĩnh vực {specialty_names}.",
            price=round(random.uniform(100000, 1000000), 0)  # ← THÊM VÀO ĐÂY
        )

        # Gán nhiều chuyên khoa
        profile.specialties.add(*doctor_specialties)

        print(f"✅ Tạo: {user.last_name} {user.first_name} | {username} | Chuyên khoa: {specialty_names}")
    else:
        print(f"⚠️  Đã tồn tại: {username}")