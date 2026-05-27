def calculate_invoice_total(appointment):
    service_fee = appointment.serviceNormal.price if appointment.serviceNormal else 0

    doctor_fee = 0
    try:
        doctor_fee = appointment.doctor.staff_profile.price or 0
    except:
        pass

    medicine_fee = 0
    try:
        for d in appointment.medical_record.prescription.details.all():
            medicine_fee += d.quantity * d.unit_price
    except:
        pass

    test_fee = 0
    try:
        for t in appointment.medical_record.test_results.select_related('test').all():
            test_fee += t.test.price or 0
    except:
        pass

    return {
        "service_fee": service_fee,
        "doctor_fee": doctor_fee,
        "medicine_fee": medicine_fee,
        "test_fee": test_fee,
        "total": service_fee + doctor_fee + medicine_fee + test_fee,
    }