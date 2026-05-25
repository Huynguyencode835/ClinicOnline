# services/ocr_service.py
import re
import os
from google.cloud import vision

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "myapp-490307-7f8c5fec59d0.json"
)

client = vision.ImageAnnotatorClient()

def extract_text_from_image(image_bytes: bytes) -> str:
    """Gửi ảnh lên Google Vision, trả về toàn bộ text."""
    image = vision.Image(content=image_bytes)
    response = client.text_detection(image=image)

    if response.error.message:
        raise Exception(f"Vision API error: {response.error.message}")

    texts = response.text_annotations
    return texts[0].description if texts else ""


def parse_insurance_card(raw_text: str) -> dict:
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    result = {
        "ma_the": None,
        "ho_ten": None,
        "ngay_sinh": None,
        "gioi_tinh": None,
        "dia_chi": None,
        "noi_dang_ky_kcb": None,
        "han_the": None,
    }

    for line in lines:
        # Tìm mã thẻ trực tiếp theo pattern: 2 chữ cái + số (DK270702162144)
        # hoặc dãy số thuần (7721716055)
        ma_match = re.search(
            r'\b([A-Z]{2}\s*\d\s*\d{2}\s*\d{3}\s*\d{3}\s*\d{4})\b',  # DK 2 70 702 162 1440
            raw_text
        )
        if not ma_match:
            ma_match = re.search(r'\b([A-Z]{2}\d{13})\b', raw_text)  # dạng liền
        if not ma_match:
            ma_match = re.search(r'\bMã\s*[Ss][ốo]\s*[:\-]?\s*(\d{10,13})\b', raw_text)  # dãy số thuần

        if ma_match:
            result["ma_the"] = re.sub(r'\s+', '', ma_match.group(1))

        # Họ tên
        ten_match = re.search(r'[Hh]ọ\s*v[àa]\s*t[êe]n\s*[:\-]\s*(.+)', line)
        if ten_match and not result["ho_ten"]:
            result["ho_ten"] = ten_match.group(1).strip().title()

        # Ngày sinh (có thể cùng dòng với giới tính)
        sinh_match = re.search(r'[Nn]g[àa]y\s*sinh\s*[:\-]\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})', line)
        if sinh_match and not result["ngay_sinh"]:
            result["ngay_sinh"] = sinh_match.group(1)

        # Giới tính (có thể cùng dòng: "Ngày sinh: 11/08/2005  Giới tính: Nam")
        gt_match = re.search(r'[Gg]i[ớo]i\s*t[íi]nh\s*[:\-]\s*(\S+)', line)
        if gt_match and not result["gioi_tinh"]:
            result["gioi_tinh"] = gt_match.group(1).strip()

        # Địa chỉ
        dc_match = re.search(r'[Đd][ịi]a\s*ch[ỉi]\s*[:\-]\s*(.+)', line)
        if dc_match and not result["dia_chi"]:
            result["dia_chi"] = dc_match.group(1).strip()

        # Nơi ĐK KCB
        kcb_match = re.search(r'[Nn][ơo]i\s*[ĐD][Kk]\s*KCB\s*\S*\s*[:\-]\s*(.+)', line)
        if kcb_match and not result["noi_dang_ky_kcb"]:
            result["noi_dang_ky_kcb"] = kcb_match.group(1).strip()

        # Giá trị sử dụng: lấy ngày bắt đầu
        han_match = re.search(
            r'[Gg]i[áa]\s*tr[ịi]\s*s[ửu]\s*d[ụu]ng\s*[:\-].+?(\d{1,2}[/-]\d{1,2}[/-]\d{4})',
            line
        )
        if han_match and not result["han_the"]:
            result["han_the"] = han_match.group(1)  # lưu tạm ngày bắt đầu

        # Thời điểm đủ 05 năm liên tục → đây mới là ngày hết hạn thực sự
        thoihan_match = re.search(
            r'[Tt]h[ờo]i\s*[đd]i[eể]m.+?(\d+)\s*n[aă]m.+?(\d{1,2}[/-]\d{1,2}[/-]\d{4})',
            line
        )
        if thoihan_match:
            nam = int(thoihan_match.group(1))  # 05
            date_str = thoihan_match.group(2)  # 01/10/2021
            day, month, year = date_str.split('/')
            expiry_year = int(year) + nam  # 2021 + 5 = 2026
            result["han_the"] = f"{day}/{month}/{expiry_year}"  # 01/10/2026

    return result