import hashlib, hmac, urllib.parse
from django.conf import settings


def verify_vnpay_signature(params: dict) -> bool:
    """Xác thực chữ ký từ VNPay callback"""
    vnp_secure_hash = params.get("vnp_SecureHash", "")

    # Loại bỏ vnp_SecureHash và vnp_SecureHashType khỏi params
    filtered = {
        k: v for k, v in params.items()
        if k not in ("vnp_SecureHash", "vnp_SecureHashType")
    }

    # Sắp xếp và tạo query string
    sorted_params = sorted(filtered.items())
    query_string = urllib.parse.urlencode(sorted_params)

    # Tạo chữ ký
    secret_key = settings.VNPAY_CONFIG["SECRET_KEY"]
    h = hmac.new(
        secret_key.encode("utf-8"),
        query_string.encode("utf-8"),
        hashlib.sha512
    )
    expected_hash = h.hexdigest()

    return hmac.compare_digest(expected_hash, vnp_secure_hash)