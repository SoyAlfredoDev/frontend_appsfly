import axios from "axios";

/*

const instance = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true

})



const instance = axios.create({
    baseURL: 'https://backend-appsfly.onrender.com/api',
    withCredentials: true

});
*/

const instance = axios.create({
    baseURL: 'http://64.176.14.37:3000/api',
    withCredentials: true

})

export default instance;