import firebase_admin
from firebase_admin import credentials, messaging, firestore

cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)


def send_push_to_user(user_id, title, body, data={}):
    db = firestore.client()

    doc = db.collection('users').document(str(user_id)).get()
    if not doc.exists:
        return

    token = doc.to_dict().get('fcmToken')
    if not token:
        return

    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body
        ),
        data={str(k): str(v) for k, v in data.items()},
        token=token,
    )

    response = messaging.send(message)