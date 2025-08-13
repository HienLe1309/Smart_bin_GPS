import './listusers.scss'
import React, { useState,useEffect} from "react";
import axios from 'axios';
import { Link, useLocation  } from 'react-router-dom';
import { UserContext } from '../context/usercontext';
import { useContext } from 'react';
import Table from 'react-bootstrap/Table';
import { FaEdit } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import _ from 'lodash'
import { url } from '../services/UserService'
import { FaCaretUp } from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa";

function ListUsers() {      
const [listUsersOriginal , setListUsersOriginal] = useState([])
const [listUsers,setListUsers] = useState([])
const [key, setKey] = useState('')
const [sortOrder, setSortOrder] = useState('asc'); // 'asc' hoặc 'desc'


const getAllUsers = async () => {   
  let success = false;
  while (!success) {
    try {
      const response = await axios.get(`${url}/User/GetAllUsers`);
      const citiesData = response.data;           
      setListUsers(citiesData); 
      setListUsersOriginal(citiesData) 
      // Kiểm tra nếu dữ liệu nhận được hợp lệ
      if (response && response.data) {
        
        success = true; // Dừng vòng lặp khi dữ liệu hợp lệ và được xử lý
      } else {
        alert('ReLoad');
      }
    } catch (error) {
      console.error('Get All Logger error, retrying...', error);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Đợi 2 giây trước khi thử lại
    }
  }
};

useEffect(() => {
  getAllUsers();
}, [])

useEffect(() => {

}, [listUsersOriginal])

useEffect(()=>{
  if(key === ''){
    getAllUsers()
  }
  else{
    let cloneListUsers = _.cloneDeep(listUsers)
    const listsearch = cloneListUsers.filter((item,index)=>{
     return item.name.includes(key)|| item.identificationNumber.includes(key)
   })
   setListUsers(listsearch)
  }
},[key])


const sortByPoints = () => {
  let sortedList = _.cloneDeep(listUsers); // Sao chép danh sách
  sortedList.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.point - b.point; // Sắp xếp tăng dần
    } else {
      return b.point - a.point; // Sắp xếp giảm dần
    }
  });
  setListUsers(sortedList); // Cập nhật danh sách đã sắp xếp
  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Đổi trạng thái sắp xếp
};


console.log('map:')
console.log(key)
   
return (
  <div className='fatherListUser'>
    <div className='wrapperListUser'>
          <div className="input-group">
              <div className="form-outline" data-mdb-input-init>
                  <input
                      onChange={(e) => setKey(e.target.value)} 
                      type="search" id="form1" className="form-control" placeholder='Tìm kiếm' />
              </div>
              <button
                // onClick={searchUser} 
                type="button" class="btn btn-primary" data-mdb-ripple-init>
                <i class="fas fa-search"></i>
              </button>
          </div>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Căn cước công dân</th>
                <th>
                  Điểm hiện tại
                  <button
                    className="btn-sort"
                    onClick={sortByPoints}
                  >
                    {sortOrder === 'asc' ?  <FaCaretUp className='icon'/> : <FaCaretDown className='icon'/>}
                  </button>
                </th>
                <th>Chỉnh sửa</th>
              </tr>
            </thead>
            <tbody>
              {listUsers.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.identificationNumber}</td>
                  <td>{item.point}</td>
                  <td>
                    <Link to={`/user/${item.id}`}>
                      <button type="button" className="btn btn-info">
                        <FaEdit className="iconEdit" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

    </div>      
  </div>
    
)
}

export default ListUsers

