import React, { useState, useEffect } from 'react'
import {Link} from "react-router-dom";
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../context/usercontext';
import { useContext } from 'react';
import { RiLogoutCircleRLine } from "react-icons/ri";
import './HeaderAdminUser.scss'
import axios from 'axios';
import { TiThMenu } from "react-icons/ti";
import { url } from '../services/UserService'
function HeaderAdminUser() {   
  const location = useLocation();     
  const [showMenu,setshowMenu] = useState(false);
  const currentPath = location.pathname;
  const [userData, setUserData] = useState({})
  const {user, logout , handelRepair, handleFull, UserLogin, setUserLogin } = useContext(UserContext);
  const navigate = useNavigate();
  const handleLogout=() => {
    setshowMenu(false)
        logout()
        if(user.auth){
              toast.success('Đăng xuất thành công')
              navigate('/')
        }
  }
  const handleEmpty=()=>{
    handleFull()
  }
  const handleRepair=()=>{
    handelRepair()
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const getPoints = async () => {
    let success = false;
    while (!success) {
      try {
        const response = await axios.get(`${url}/User/GetUserByUserName?userName=${user.email}`);
        const userData = response.data;
        setUserLogin(userData)
        // Kiểm tra nếu dữ liệu nhận được hợp lệ
        if (response && userData) {
          
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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
   
    if(user.auth){
      
      // getPoints()
    }
  }, [user])

const handleShowMenu = () =>{
  setshowMenu(pre=>!pre)
}

   
useEffect(() => {     
      setshowMenu(false)       
},[currentPath])
  
  return (
    <>
                      <div class="nav-linksAdminUser">
                        <div 
                            className='iconMenu'
                            onClick={handleShowMenu}
                        >
                            <TiThMenu/>
                        </div>
                        
                        
                            <div className='nav-links-container'>
                              <div class={currentPath === '/' ? 'highlight' : 'center'}><Link  to="/listUser">Danh sách</Link></div>
                              
                              {user && user.auth ? <div  className='center logout'  onClick={handleLogout}><RiLogoutCircleRLine className='iconLogout'/>Đăng xuất</div> : <div class="center"><Link  to="/login">Đăng nhập</Link></div> }
                            
                            </div>
                         
                        
                        {showMenu &&
                            <div className='nav-links-container-mobile'>  
                  
                              <div class={currentPath === '/' ? 'highlight' : 'center'}><Link  to="/">Giới thiệu</Link></div>
                              <div class={currentPath === '/map' ? 'highlight' : 'center'}><Link  to="/map">Bản đồ</Link></div>
                                
                              {user && user.auth ?
                                  <div>
                                    <div class={currentPath === '/setting' ? 'highlight' : 'center'}><Link  to="/setting">Tài khoản</Link></div>
                                    {/* <div class={currentPath === '/historypoint' ? 'highlight' : 'center'}><Link  to="/historypoint">Lịch sử điểm</Link></div> */}
                                  </div> : ''
                              }  
                              {user && user.auth ? <div  className='center logout'  onClick={handleLogout}><RiLogoutCircleRLine className='iconLogout'/>Đăng xuất</div> : <div class="center"><Link  to="/login">Đăng nhập</Link></div> } 

                            </div>
                                
                        }
                  
                      </div>

                       
    </>
  )
}

export default HeaderAdminUser
