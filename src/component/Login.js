import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";
import { AiTwotoneEye } from "react-icons/ai";
import { AiTwotoneEyeInvisible } from "react-icons/ai";
import { toast } from 'react-toastify';
import { Link } from "react-router-dom";
import { UserContext } from '../context/usercontext';
import { useContext } from 'react';
import { LoginAPI } from '../services/UserService';
import './Login.scss';
import Register from './Register';
import { url } from '../services/UserService';
import { processBinsAndUpdatePoints } from '../services/BinService'; // Import hàm từ BinService

function Login() {
  const [isShowRegister, setIsShowRegister] = useState(false);
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const { user } = useContext(UserContext);
  const { loginContext, token, setToken, LoginTotal, setLoginTotal, loginTotalLogin } = useContext(UserContext);

  useEffect(() => {
    loginTotalLogin('User');
  }, []);

  const handleLogin = async () => {
    if (!userName || !password) {
      toast.error('Bạn chưa nhập mật khẩu');
      return;
    }

    let res = await LoginAPI(userName, password);
    console.log('res', res);

    if (res.status === 500) {
      toast.error('Tên tài khoản hoặc mật khẩu không đúng');
    } else {
      if (user.auth) {
        return;
      } else {
        loginContext(userName, res);
        toast.success('Đăng nhập thành công');
        // Gọi processBinsAndUpdatePoints với userName sau khi đăng nhập thành công
        await processBinsAndUpdatePoints(userName);
        navigate('/about');
      }
    }
  };

  const handleCloseRegister = () => {
    setIsShowRegister(false);
  };

  const handleShowRegister = () => {
    setIsShowRegister(true);
  };

  return (
    <>
      <div className="container">
        <div className="wrapper">
          <div className="title"><span>Người dùng</span></div>
          <div className="form">
            <div className="row">
              <i className="fas fa-user"></i>
              <input
                type="text"
                placeholder="Tên tài khoản"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="row">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="row button">
              <button
                className="button-login"
                onClick={handleLogin}
              >
                Đăng nhập
              </button>
            </div>

            {LoginTotal === 'User' && (
              <div className="signup-link">Bạn chưa đăng kí ? <br />
                <button
                  className="button-register"
                  onClick={handleShowRegister}
                >Đăng kí
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Register
        show={isShowRegister}
        handleClose={handleCloseRegister}
      />
    </>
  );
}

export default Login;
