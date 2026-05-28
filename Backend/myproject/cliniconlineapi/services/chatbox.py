import google.generativeai as genai
import os

from cliniconlineapi.models import Specialty,User

genai.configure(
    api_key=os.getenv('GENIA_API_KEY'),
)

_model = None


def get_cached_model():
    global _model
    if _model is None:
        specialties = Specialty.objects.filter(active=True)
        doctors = User.objects.filter(
            role=User.Role.DOCTOR
        ).select_related("staff_profile").prefetch_related(
            "staff_profile__specialties"
        )

        dept_list = "\n".join([
            f"- {s.name}: {s.description}"
            for s in specialties
        ])

        doctor_list = "\n".join([
            f"- BS. {d.last_name} {d.first_name} "
            f"| Chuyên khoa: {', '.join(sp.name for sp in d.staff_profile.specialties.all())} "
            f"| Kinh nghiệm: {d.staff_profile.experience or 'chưa cập nhật'} năm "
            f"| Học vị: {d.staff_profile.degree or 'chưa cập nhật'}"
            for d in doctors
        ])

        prompt = f"""
        Bạn là trợ lý y tế của phòng khám. Nhiệm vụ:
        1. Lắng nghe triệu chứng và gợi ý chuyên khoa phù hợp
        2. Gợi ý bác sĩ phù hợp với triệu chứng
        3. Trả lời câu hỏi sức khỏe cơ bản

        DANH SÁCH CHUYÊN KHOA:
        {dept_list}

        DANH SÁCH BÁC SĨ:
        {doctor_list}

        QUY TẮC:
        - Chỉ gợi ý chuyên khoa và bác sĩ có trong danh sách trên
        - Không chẩn đoán bệnh cụ thể
        - Triệu chứng nghiêm trọng → khuyên đến cấp cứu ngay
        - Trả lời tiếng Việt, thân thiện, ngắn gọn
        - Câu hỏi không liên quan y tế → từ chối lịch sự
        """
        _model = genai.GenerativeModel(
            model_name="models/gemini-2.5-flash-lite",
            system_instruction=prompt
        )
    return _model