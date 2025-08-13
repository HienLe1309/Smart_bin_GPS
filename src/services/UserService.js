import axios from './customize-axios';
const url = 'http://smartbinsawaco123.runasp.net'
const fetchAllUsers = (page)=>{
    return axios.get(`/api/users?page=${page}`)
}
const createUser = (name,job) =>{
    return axios.post('/api/users', {name:name,job:job})
}
const editUser = (name,job) =>{
    return axios.put(`${url}/users/2`, {name:name,job:job})
}
const editPassword = (name,job) =>{
    return axios.put(`${url}/User/ChangePassword`, {name:name,job:job})
}
const deleteUser = (id) =>{
    return axios.delete(`/api/users/${id}`)
}
const LoginAPI = (email,password) =>{
    return axios.post(`${url}/User/Login`,{userName:email,password:password})
}
const Login_Admin_API = (email,password) =>{
    return axios.post(`${url}/Admin/BinAdminLogin`,{userName:email,password:password})
}
const Login_UserAdmin_API = (email,password) =>{
    return axios.post(`${url}/Admin/UserAdminLogin`,{userName:email,password:password})
}
export {fetchAllUsers,createUser,editUser,deleteUser,LoginAPI,Login_Admin_API,Login_UserAdmin_API, url}