// import React,{useState,useEffect} from 'react'
// import './settingUser.scss'
// import ChangeInforAccount from '../Change/ChangeInforAcount'
// import ChangeInforLogin from '../Change/ChangeInforLogin'
// import axios from 'axios';
// import { url } from '../services/UserService'
// import { useContext } from 'react';
// import { UserContext } from '../context/usercontext';

// function SettingUser() {                                         
                                                                                      
//     const [showChangeLogin, setshowChangeLogin] = useState(false)
//     const [showChangeAccount, setshowChangeAccount] = useState(false)
//     const {user, logout, handelRepair, handleFull, UserLogin, setUserLogin } = useContext(UserContext);
//     const [userData, setUserData] = useState({})    
                           
//     const handleshowModalChangeLogin= () => {
//       setshowChangeLogin(true)
//     }    
//     const handleCloseModalChangeLogin=() => {
//       setshowChangeLogin(false)
//       getPoints()
//     }
//     const handleshowModalChangeAccount=() => {
//       setshowChangeAccount(true)
//     }
//     const handleCloseModalChangeAccount=() => {
//       setshowChangeAccount(false)
//       getPoints()
//     }
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// const getPoints = async () => {
//   let success = false;
//   while (!success) {
//     try {
//       const response = await axios.get(`${url}/User/GetUserByUserName?userName=${user.email}`);
//       const userData = response.data;
//       setUserLogin(userData)
//       // Kiểm tra nếu dữ liệu nhận được hợp lệ
//       if (response && userData) {
        
//         success = true; // Dừng vòng lặp khi dữ liệu hợp lệ và được xử lý
//       } else {
//         alert('ReLoad');
//       }
//     } catch (error) {
//       console.error('Get All Logger error, retrying...', error);
//       await new Promise(resolve => setTimeout(resolve, 2000)); // Đợi 2 giây trước khi thử lại
//     }
//   }
// };    

//   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   useEffect(() => {
   
//     if(user.auth){
      
//       getPoints()
//     }
//   }, [user])

// console.log('UserLogin', UserLogin)
//   return (   
//     <div className='fatherUser'>
//       <div className='father-wrapper'>
//         <div className='accountInformation'>
//           <div className='accountInformation-title'>Thông tin tài khoản</div>
//           <div className='accountInformation-main'>
//             <div className='accountInformation-main-first'>
//               <div className='label'>Họ và tên</div>
//               <div className='value'>{UserLogin.name}</div>
//             </div>
//             <div className='accountInformation-main-second'>
//               <div className='label'>Điểm hiện tại</div>
//               <div className='value'>{UserLogin.point}</div>
//             </div>
//           </div>
//           <div className='accountInformation-button'>
//               <button 
//                   className='btn'
//                   onClick={handleshowModalChangeAccount}              
//               >Cập nhật
//               </button>
//           </div>
//         </div>
//         <div className='loginInformation'>
//           <div className='loginInformation-title'>Thông tin đăng nhập</div>
//           <div className='loginInformation-main'>
//             {/* <div className='loginInformation-main-first'>
//               <div className='label'>UserName</div>
//               <div className='value'>{UserLogin.userName}</div>
//             </div> */}
//             <div className='loginInformation-main-second'>
//               <div className='label'>Mật khẩu</div>
//               <div className='value'>{UserLogin.password}</div>
//             </div>
//           </div>
//           <div className='loginInformation-button'>
//                 <button 
//                     className='btn'
//                     onClick={handleshowModalChangeLogin}
//                     >                    
//                   Cập nhật
//                 </button>
//           </div>
//         </div>
//         <ChangeInforLogin
//             show={showChangeLogin} 
//             handleClose={handleCloseModalChangeLogin}
//             userName={UserLogin.userName} // 👈 truyền userName
//             token={user.token} // nếu cần truyền token để xác thực API
//         />
//         <ChangeInforAccount
//             show={showChangeAccount} 
//             handleClose={handleCloseModalChangeAccount}
//             userName={UserLogin.userName} // 👈 truyền userName
//             token={user.token} // nếu cần truyền token để xác thực API
//             Userdata={UserLogin}
//         />
//       </div>

     
//     </div>
      
    
    
//   )
// }

// export default SettingUser
import React, { useState, useEffect } from 'react'
import './settingUser.scss'
import ChangeInforAccount from '../Change/ChangeInforAcount'
import ChangeInforLogin from '../Change/ChangeInforLogin'
import axios from 'axios';
import { url } from '../services/UserService'
import { useContext } from 'react';
import { UserContext } from '../context/usercontext';

function SettingUser() {                                         
                                                                                      
    const [showChangeLogin, setshowChangeLogin] = useState(false)
    const [showChangeAccount, setshowChangeAccount] = useState(false)
    const [showPassword, setShowPassword] = useState(false) // State để quản lý ẩn/hiện mật khẩu
    const {user, logout, handelRepair, handleFull, UserLogin, setUserLogin } = useContext(UserContext);
    const [userData, setUserData] = useState({})    
                           
    const handleshowModalChangeLogin = () => {
      setshowChangeLogin(true)
    }    
    const handleCloseModalChangeLogin = () => {
      setshowChangeLogin(false)
      getPoints()
    }
    const handleshowModalChangeAccount = () => {
      setshowChangeAccount(true)
    }
    const handleCloseModalChangeAccount = () => {
      setshowChangeAccount(false)
      getPoints()
    }
    // Hàm toggle ẩn/hiện mật khẩu
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
   
    if(user.auth){
      
      getPoints()
    }
  }, [user])

console.log('UserLogin', UserLogin)
  return (   
    <div className='fatherUser'>
      <div className='father-wrapper'>
        <div className='accountInformation'>
          <div className='accountInformation-title'>Thông tin tài khoản</div>
          <div className='accountInformation-main'>
            <div className='accountInformation-main-first'>
              <div className='label'>Họ và tên</div>
              <div className='value'>{UserLogin.name}</div>
            </div>
            <div className='accountInformation-main-second'>
              <div className='label'>Điểm hiện tại</div>
              <div className='value'>{UserLogin.point}</div>
            </div>
          </div>
          <div className='accountInformation-button'>
              <button 
                  className='btn'
                  onClick={handleshowModalChangeAccount}              
              >Cập nhật
              </button>
          </div>
        </div>
        <div className='loginInformation'>
          <div className='loginInformation-title'>Thông tin đăng nhập</div>
          <div className='loginInformation-main'>
            <div className='loginInformation-main-second'>
              <div className='label'>Mật khẩu</div>
              <div className='value password-wrapper'>
                <span>{showPassword ? UserLogin.password : '••••••••'}</span>
                <i 
                  className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'} 
                  onClick={togglePasswordVisibility}
                  style={{ cursor: 'pointer', marginLeft: '10px' }}
                ></i>
              </div>
            </div>
          </div>
          <div className='loginInformation-button'>
                <button 
                    className='btn'
                    onClick={handleshowModalChangeLogin}
                    >                    
                  Cập nhật
                </button>
          </div>
        </div>
        <ChangeInforLogin
            show={showChangeLogin} 
            handleClose={handleCloseModalChangeLogin}
            userName={UserLogin.userName}
            token={user.token} // Truyền token để xác thực API
        />
        <ChangeInforAccount
            show={showChangeAccount} 
            handleClose={handleCloseModalChangeAccount}
            userName={UserLogin.userName}
            token={user.token} // Truyền token để xác thực API
            Userdata={UserLogin}
        />
      </div>
    </div>
  )
}

export default SettingUser