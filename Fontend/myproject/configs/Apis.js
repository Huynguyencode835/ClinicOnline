import axios from "axios";

const Base_URL = 'http://192.168.219.1:8000/';

export const endpoints = {
    'doctors': '/doctors/',
    'doctorDetail': (id) => `/doctors/${id}/doctor_detail/`
}

export default axios.create({
    baseURL: Base_URL
});