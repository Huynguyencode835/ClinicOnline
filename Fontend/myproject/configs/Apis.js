import axios from "axios";
import {API_URL} from "@env"

const Base_URL = API_URL;

console.log(API_URL);

export const endpoints = {
    'doctors': '/doctors/',
    'doctorDetail': (id) => `/doctors/${id}/doctor_detail/`,
    'login': '/o/token/',
    'profile': '/users/profile_user/',
    'register': '/users/',
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