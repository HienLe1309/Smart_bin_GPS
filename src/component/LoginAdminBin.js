import React,{useState,useEffect} from 'react'
import { useNavigate, useLocation  } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";
import { AiTwotoneEye } from "react-icons/ai";
import { AiTwotoneEyeInvisible } from "react-icons/ai";
import {  toast } from 'react-toastify';
import {Link} from "react-router-dom";
import { UserContext } from '../context/usercontext';
import { useContext } from 'react';
import { Login_Admin_API } from '../services/UserService';
import './Login.scss'
import Register from './Register';
import { url } from '../services/UserService';
import axios from 'axios';         
function LoginAdminBin() {
  
    const [isShowRegister,setisShowRegister] = useState(false)
    const navigate = useNavigate();
    const [userName,setuserName]=useState('')
    const [password,setpassword]=useState('')
    const { user } = useContext(UserContext);
    const { loginContext, token, setToken, LoginTotal, setLoginTotal, loginTotalLogin  } = useContext(UserContext);

    const [loading, setLoading] = useState(false); // Thêm trạng thái loading
    const [ListAllCustomer, setListAllCustomer] = useState([]); // Thêm trạng thái loading
  
    const getAllCustomer = async () => {      
      let success = false;
      while (!success) {
        try {
          const response = await axios.get(`${url}/Admin/GetBinAdmin`);    
          const res = response.data;
    
          // Kiểm tra nếu dữ liệu nhận được hợp lệ
          if (res && res.length > 0) {
            setListAllCustomer(res);
            
            // const ListStolen = LoggerData.filter((item) => item.stolen === true);
            // setlistLoggerStolen(ListStolen);
    
            success = true; // Dừng vòng lặp khi dữ liệu hợp lệ và được xử lý
          } else {
  
          }
        } catch (error) {
          console.error('Get All Devices error, retrying...', error);  
          await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 2 giây trước khi thử lại
        }
      }
    };
  
    useEffect(()=>{
      getAllCustomer()
    },[])

    useEffect(() => {
          loginTotalLogin('AdminBin')
    },[])

    useEffect(() => {
      const handleBackButton = () => {
        console.log("Nút Back trên trình duyệt được nhấn!");
        customFunction(); // Gọi hàm xử lý logic tại đây
      };
  
      // Lắng nghe sự kiện popstate
      const onPopState = () => {
        handleBackButton();
      };
  
      window.addEventListener("popstate", onPopState);
  
      // Cleanup khi component bị hủy
      return () => {
        window.removeEventListener("popstate", onPopState);
      };
    }, []);
  
    const customFunction = () => {
      alert("Đây là hàm xử lý khi nhấn nút Back trên trình duyệt!");
    };

   
    const handleLogin =  async () => {
     
      if(!userName || !password ){
          toast.error('Bạn chưa nhập mật khẩu')
          return
      }

      let res = await Login_Admin_API(userName,password)
      console.log('res',res)
      
      if(res.status === 500){
          toast.error('Tên tài khoản hoặc mật khẩu không đúng')
      }
      else{
            if(user.auth){
              return
            } 
      else{
          const checkName = ListAllCustomer.find((item) => item.userName === userName);
          console.log('checkName',checkName)
          if(checkName){
            sessionStorage.setItem('phoneNumber', checkName.userPhoneNumber);
            console.log('phoneNumber: ',checkName.userPhoneNumber)
          }
          loginContext(userName,res)
          toast.success('Đăng nhập thành công')
          navigate('/map')
      }
      }    
  }
  const handleCloseRegister = ()=>{
        setisShowRegister(false)
  }
  const handleShowRegister = ()=>{
    setisShowRegister(true)
  }
      return (
        <>
        <div class="container">
                <div class="wrapper">
                  <div class="title"><span>Giám sát</span></div>
                  <div className='form'>
                    <div class="row">
                      <i class="fas fa-user"></i>
                      <input 
                            type="text" placeholder="User Name" 
                            value={userName}
                            onChange={(e)=>setuserName(e.target.value)}
                      />
                    </div>
                    <div class="row">
                      <i class="fas fa-lock"></i>
                      <input 
                                type = 'password' 
                                placeholder="Mật khẩu" 
                                value={password}
                                onChange={(e) => setpassword(e.target.value)}
                      />
                    </div>
                    <div class="row button">
                      <button   
                                className='button-login'
                                onClick={handleLogin}>
                          Đăng nhập
                      </button>
                  
                    </div>

                   
                    
              
                  </div>
                </div>  
        </div>
        
      
        </>

       
  )
}

export default LoginAdminBin
   
            
    
    
   
   
   
    
    
    