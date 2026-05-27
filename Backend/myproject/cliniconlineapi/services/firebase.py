import firebase_admin
from firebase_admin import credentials, messaging, firestore

cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)


def send_push_to_user(user_id, title, body, data={}):
    db = firestore.client()

    # Đọc FCM token từ Firestore
    doc = db.collection('users').document(str(user_id)).get()
    if not doc.exists:
        print(f'Không tìm thấy user {user_id} trong Firestore')
        return

    token = doc.to_dict().get('fcmToken')
    if not token:
        print(f'User {user_id} chưa có FCM token')
        return

    # Gửi push notification
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body
        ),
        data={str(k): str(v) for k, v in data.items()},
        token=token,
    )

    response = messaging.send(message)
    print(f'Gửi thông báo thành công: {response}')