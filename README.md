# ClinicOnline

Hệ thống quản lý phòng khám trực tuyến (**ClinicOnline**) gồm hai phần chính:

- **Backend**: REST API xây dựng bằng **Django + Django REST Framework**.
- **Frontend**: ứng dụng di động **React Native (Expo)** cho bệnh nhân, bác sĩ, nhân viên y tế và quản trị viên.

Ứng dụng cho phép bệnh nhân đặt lịch khám, quản lý hồ sơ bệnh án, thanh toán online; bác sĩ quản lý lịch làm việc và lập bệnh án, kê đơn thuốc, nhập kết quả xét nghiệm; quản trị viên theo dõi thống kê doanh thu và bệnh nhân.

---

## Tính năng chính

### Theo vai trò người dùng

- **Bệnh nhân (Customer)**
  - Đăng ký / đăng nhập (OAuth2, làm mới token tự động).
  - Xem danh sách bác sĩ, chuyên khoa, dịch vụ.
  - Đặt lịch hẹn theo nhiều bước: chọn chuyên khoa → bác sĩ → thời gian → xác nhận.
  - Xem / hủy lịch hẹn, thanh toán hóa đơn qua **VNPay**.
  - Xem hồ sơ bệnh án, đơn thuốc, kết quả xét nghiệm.
  - Quét **thẻ bảo hiểm y tế** bằng OCR để tự điền thông tin.
  - Trò chuyện với **chatbox hỗ trợ (Gemini AI)**.
  - Nhận **thông báo đẩy (Firebase Push)** về trạng thái lịch hẹn.

**Bác sĩ (Doctor)**
  - Quản lý **lịch làm việc (WorkDay)** và khung giờ đặt (time slot).
  - Xác nhận / từ chối lịch hẹn.
  - Lập và cập nhật **bệnh án**, **đơn thuốc**, **kết quả xét nghiệm**.
  - Khởi tạo hóa đơn thanh toán cho bệnh nhân.

**Nhân viên y tế (Healthcare)**
  - Quản lý kho **thuốc** (thêm, sửa, theo dõi tồn kho / hết hạn).
  - Quản lý lịch làm việc.

**Quản trị viên (Superuser)**
  - Tạo tài khoản nhân viên.
  - Xem **thống kê**: độ tuổi, giới tính, chuyên khoa, dịch vụ, doanh thu theo tháng.

---

## 2. Kiến trúc hệ thống

```
┌──────────────────┐        HTTP / JSON        ┌────────────────────┐
│   Frontend       │ ────────────────────────► │      Backend       │
│  (React Native   │                           │   Django + DRF     │
│   / Expo)        │ ◄──────────────────────── │   (OAuth2 API)     │
└──────────────────┘                           └─────────┬──────────┘
                                                         │
                    ┌────────────────────────────┬───────┴──────┬──────────────┐
                    │                            │              │              │
                    ▼                            ▼              ▼              ▼
             MySQL (PyMySQL)            Cloudinary (ảnh)   VNPay (thanh toán) Firebase (thông báo)
             chia làm                   (avatar, kết quả   Gemini (chatbox)
             cliniconline                xét nghiệm)        OCR (thẻ BHYT)
```

### 2.1 Backend — công nghệ & gói chính

| Thành phần | Công nghệ |
|-----------|-----------|
| Framework | Django 6.0.3, Django REST Framework 3.16.1 |
| Xác thực | django-oauth-toolkit 3.2.0 (OAuth2), drf-social-oauth2 (Google) |
| Database | MySQL (`PyMySQL`) |
| Upload / Ảnh | Cloudinary (django-cloudinary-storage) |
| API Docs | drf-yasg (Swagger / Redoc) |
| Thanh toán | Tích hợp VNPay (sandbox) |
| Chatbox AI | Google Gemini API |
| Thông báo | Firebase Cloud Messaging (FCM) |
| OCR thẻ BHYT | Xử lý ảnh + parse thông tin thẻ |

**Cấu trúc thư mục Backend (`Backend/myproject/`):**

```
myproject/
├── manage.py
├── requirements.txt
├── seed.py                  # Dữ liệu mẫu
├── run_django.sh            # Script chạy server
├── .env                     # Biến môi trường (không commit)
├── myproject/               # Cấu hình Django (settings, urls, wsgi/asgi)
└── cliniconlineapi/         # Ứng dụng chính
    ├── models.py            # Mô hình dữ liệu
    ├── views.py             # ViewSet / APIView
    ├── urls.py              # Định nghĩa endpoint
    ├── serializers/         # Bộ serializer theo nguồn nghiệp vụ
    ├── services/            # Nghiệp vụ bên ngoài (VNPay, Gemini, FCM, OCR, hóa đơn)
    ├── permission.py        # Nhóm quyền (staff, doctor, customer, admin)
    ├── paginators.py        # Phân trang
    ├── validators.py        # Kiểm tra dữ liệu & quyền cập nhật
    ├── admin.py
    └── migrations/
```

### 2.2 Frontend — công nghệ & gói chính

React Native 0.81.5 / Expo ~54, React Navigation (stack + bottom-tabs), React Native Paper (UI), Axios, AsyncStorage + expo-secure-store (lưu token), react-native-calendars, react-native-chart-kit, expo-image-picker, expo-print, expo-sharing, expo-notifications, @react-native-firebase (app / messaging / firestore), react-native-webview (VNPay), vnpay.

**Cấu trúc thư mục Frontend (`Fontend/myproject/`):**

```
myproject/
├── App.js                  # Root: navigation, auth, push notification
├── app.json                # Cấu hình Expo
├── package.json / babel.config.js
├── configs/
│   ├── Apis.js             # Danh cáp endpoint + axios instance
│   └── firebase/           # Thông tin đẩy
├── screens/                # Màn hình theo Source nghiệp vụ
│   ├── Appointment/        # Đặt lịch, danh sách, chi tiết
│   ├── BoxChat/            # Chatbox Gemini
│   ├── Home/  Search/
│   ├── MedicalRecord/      # Bệnh án, đơn thuốc, xét nghiệm
│   ├── Medicine/           # Quản lý thuốc
│   ├── Payment/            # Hóa đơn + VNPay WebView
│   ├── Report/             # Thống kê cho quản trị
│   ├── User/               # Đăng nhập, đăng ký, hồ sơ, lịch
│   └── WorkDay/            # Lịch làm việc của bác sĩ/nhân viên
├── components/             # UI tái sử dụng (Button, Header, Alert, List…)
├── utils/                  # apiHelper, contexts (User, SnackBar, Alert), reducers, format…
└── styles/                 # Colors, Mystyles chung
```

---

## 3. Mô hình dữ liệu (Backend)

Các mô hình chính trong `cliniconlineapi/models.py`:

| Mô hình | Mô tả |
|--------|------|
| `User` (AbstractUser) | Tài khoản, có `role` (customer/doctor/healthcare), avatar, giới tính, ngày sinh |
| `CustomerProfile` | Hồ sơ bệnh nhân: chiều cao, cân nặng, nhóm máu, BHYT, tiền sử dị ứng |
| `StaffProfile` | Hồ sơ nhân viên/bác sĩ: chuyên khoa, bằng cấp, kinh nghiệm, giá khám |
| `StaffSpecialty` | Liên kết nhân viên – chuyên khoa (nhiều-nhiều) |
| `Specialty` | Chuyên khoa |
| `ServiceSpecialty` | Dịch vụ theo chuyên khoa |
| `ServiceNormal` | Dịch vụ khám thường |
| `WorkDay` | Ngày làm việc của nhân viên |
| `TimeSlot` | Khung giờ của một WorkDay (Available / Booked) |
| `Appointment` | Lịch hẹn (Pending/Confirmed/Pending_payment/Completed/Canceled) |
| `MedicalRecord` | Bệnh án (chuẩn đoán, ghi chú, tái khám) |
| `Medicine` | Thuốc (tồn kho, hạn sử dụng) |
| `Prescription` & `PrescriptionDetail` | Đơn thuốc theo bệnh án + chi tiết liều dùng |
| `Test` & `TestResult` | Loại xét nghiệm & kết quả test |

---

## 4. API chính (tóm tắt)

| Endpoint | Phương thức | Mô tả |
|----------|------------|-------|
| `/users/` | POST | Đăng ký tài khoản |
| `/users/profile_user/` | GET/PATCH | Hồ sơ hiện tại |
| `/users/workday_staff/` | GET/POST | Lịch làm việc của nhân viên |
| `/doctors/` | GET | Danh sách / chi tiết bác sĩ |
| `/appointments/` | CRUD | Quản lý lịch hẹn |
| `/appointments/{id}/invoice/` | GET | Xem hóa đơn |
| `/appointments/{id}/vnpay/create/` | POST | Tạo URL thanh toán VNPay |
| `/appointments/vnpay/return/` | GET | Callback kết quả thanh toán |
| `/specialtys/` | GET | Chuyên khoa, bác sĩ theo chuyên khoa |
| `/services_normal/` | GET | Dịch vụ khám |
| `/chatbox/` | POST | Chat với Gemini |
| `/insurance-card/scan/` | POST | OCR thẻ bảo hiểm y tế |
| `/medicines/` | CRUD | Quản lý thuốc |
| `/prescriptions/` | CRUD | Đơn thuốc |
| `/medical-records/` | CRUD | Bệnh án |
| `/tests/` · `/test-results/` | CRUD | Xét nghiệm |
| `/stats?type=...` | GET | Thống kê (age/gender/specialty/serviceNormal/totalSales) |
| `/admin/` | – | Django Admin |
| `/swagger/` · `/redoc/` | – | Tài liệu API |

---

## 5. Hướng dẫn cài đặt

### Yêu cầu

- Python 3.11+ và pip
- MySQL (hoặc MariaDB) chạy localhost
- Node.js 18+ và npm
- (Tùy chọn) tài khoản Cloudinary, Firebase, VNPay sandbox, Gemini API

### 5.1 Backend

```bash
cd Backend/myproject

# Tạo & kích hoạt môi trường ảo
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux/macOS

# Cài dependencies
pip install -r requirements.txt

# Cấu hình .env (tạo từ file .env.example nếu có):
#   MYSQL_USER=<password mysql root>
#   CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
#   VNPAY_TMN_CODE / VNPAY_SECRET_KEY
#   GEMINI_API_KEY

# Cấu hình database (tạo database tên `cliniconline`)
python manage.py migrate

# Tạo dữ liệu mẫu (tùy chọn)
python manage.py seed

# Bắt buộc cấu hình OAuth2 (tạo CLIENT_ID/CLIENT_SECRET)
python manage.py runserver 0.0.0.0:8000
```

> Lưu ý: `CLIENT_ID` / `CLIENT_SECRET` được dùng để đăng nhập OAuth2 từ app. Trong `settings.py` có giá trị mặc định dành riêng cho phát triển.

### 5.2 Frontend (Expo)

1. Cấu hình `Font end/.env` với `API_URL` trỏ tới URL backend (ví dụ `http://192.168.x.x:8000`).
2. Sao chép `google-services.json` (Firebase) vào thư mục project nếu dùng thông báo đẩy.

```bash
cd Fontend/myproject
npm install
npm start              # Expo dev server (QR để mở trên máy)
npm run android        # chạy trực tiếp trên Android
```

---

## 6. Kế hoạch phát triển / Ghi chú

- Xác thực sử dụng **OAuth2** (django-oauth-toolkit): đăng nhập, làm mới token, đăng xuất.
- Token được lưu bảo mật bằng `expo-secure-store`.
- Thanh toán VNPay ở **chế độ sandbox** (cần cấu hình tài khoản thật khi lên production).
- Khóa API chứa trong file (`.env` / `settings.py`) — **không đẩy lên git**; xem `.gitignore`.

---

## 7. Giấy phép

Dự án phục vụ mục đích học tập/phát triển phòng khám trực tuyến. Vui lòng liên hệ đội ngũ phát triển để biết thêm chi tiết.