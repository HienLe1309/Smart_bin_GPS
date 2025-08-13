//Trang chủ
import React,{useState,useEffect} from 'react'
import { useNavigate, useLocation  } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";
import { AiTwotoneEye } from "react-icons/ai";
import { AiTwotoneEyeInvisible } from "react-icons/ai";
import {  toast } from 'react-toastify';
import {Link} from "react-router-dom";
import { UserContext } from '../context/usercontext';
import { useContext } from 'react';
import { LoginAPI } from '../services/UserService';
import './totalLogin.scss'
import Register from './Register';
import { url } from '../services/UserService';
import { FaUser, FaUserShield, FaUserTie } from "react-icons/fa"; // Import icons             
// function TotalLogin() {

//   const { loginContext, token, setToken, TotalLogin, loginTotalLogin, logoutTotalLogin, LoginTotal} = useContext(UserContext);



//   //   const [isShowRegister,setisShowRegister] = useState(false)
//     const navigate = useNavigate();

//   const handleTotalLoginUser = ( ) => {
//         loginTotalLogin('User')
//   }
//   const handleTotalLoginAdminBin = ( ) => {
//         loginTotalLogin('AdminBin')
//   }
//   const handleTotalLoginAdminUser = ( ) => {
//         loginTotalLogin('AdminUser')
//   }

//   useEffect(()=>{

//   },[])
//   // }
//       return (
//         <>
//         <div class="containerTotal">
//                 <div class="wrapperTotal">    
//                   <div class="titleTotal"><span>Đăng nhập</span></div>
//                   <div className='formTotal'>
//                     <Link  to="/loginUser">Người dùng</Link>               
//                     <Link  to="/loginAdminBin">Giám sát</Link>                   
//                     <Link  to="/loginAdminUser">Quản trị viên</Link>                
//                   </div>
//                 </div>  
//         </div>
        
       
//         </>

       
//   )
// }

// export default TotalLogin
   
function TotalLogin() {
  const { loginTotalLogin } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <>
      <div className="containerTotal">
        <div className="wrapperTotal">
          <div className="titleTotal">
            <span>Đăng nhập</span>
          </div>
          <div className="formTotal">
            <Link to="/loginUser" className="login-option">
              <FaUser className="icon" /> Người dùng
            </Link>
            <Link to="/loginAdminBin" className="login-option">
              <FaUserShield className="icon" /> Quản trị viên
            </Link>
            <Link to="/loginAdminUser" className="login-option">
              <FaUserTie className="icon" /> Quản lý điểm
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default TotalLogin;            
    
    
   
   
   
    
    
    