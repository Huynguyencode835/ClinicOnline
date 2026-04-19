import axios from "axios";

const Base_URL = 'http://192.168.100.110:8000/';

export const endpoints = {
    'doctors': '/doctors/',
    'doctorDetail': (id) => `/doctors/${id}/doctor_detail/`,
    'register': '/users/',
    'login': '/o/token/',
    'profile': '/users/profile_user/',
}

export const authApis = (token) => {
    return axios.create({
        baseURL: Base_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
};


export default axios.create({
    baseURL: Base_URL
});