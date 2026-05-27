import hashlib, hmac, urllib.parse
from datetime import datetime
from django.conf import settings

def create_vnpay_url(order_id, amount, order_info, ip_addr):
    cfg = settings.VNPAY_CONFIG
    vnp_params = {
        "vnp_Version": "2.1.0",
        "vnp_Command": "pay",
        "vnp_TmnCode": cfg["TMN_CODE"],
        "vnp_Amount": str(int(amount) * 100),
        "vnp_CurrCode": "VND",
        "vnp_TxnRef": str(order_id),
        "vnp_OrderInfo": order_info,
        "vnp_OrderType": "other",
        "vnp_Locale": "vn",
        "vnp_ReturnUrl": cfg["RETURN_URL"],
        "vnp_IpAddr": ip_addr,
        "vnp_CreateDate": datetime.now().strftime("%Y%m%d%H%M%S"),
    }

    sorted_params = sorted(vnp_params.items())
    query_string = urllib.parse.urlencode(sorted_params)

    h = hmac.new(
        cfg["SECRET_KEY"].encode("utf-8"),
        query_string.encode("utf-8"),
        hashlib.sha512
    )
    secure_hash = h.hexdigest()

    return f"{cfg['PAYMENT_URL']}?{query_string}&vnp_SecureHash={secure_hash}"