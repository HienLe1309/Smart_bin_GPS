import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserContext } from '../context/usercontext';
import { useContext } from 'react';
import { RiLogoutCircleRLine } from 'react-icons/ri';
import { url } from '../services/UserService';
import axios from 'axios';
import './Header.scss';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, logout, handleFull, handelRepair, showCollection, toggleShowCollection,
     displayNav, setDisplayNav, setPercentBattery, setPressPercentBattery, triggerDisplayBatteryRoute,
     unreadCount, setUnreadCount, listNotifications, setListNotifications } = useContext(UserContext);
  const [showPercentBattery, setshowPercentBattery] = useState(false);
  const [valueBattery, setValueBattery] = useState(50);
  const [phone, setPhone] = useState('');

  const handleShowPercentBattery = () => {
    setshowPercentBattery((prev) => !prev);
  };

  const handleChangeBattery = (event) => {
    setValueBattery(event.target.value);
  };

  const handleSelectPercentBattery = () => {
    if (location.pathname === '/map') {
      setDisplayNav(false);
      setPercentBattery(valueBattery);
      setPressPercentBattery((prev) => !prev);
    }
  };

  const handleLogout = () => {
    logout();
    if (user.auth) {
      toast.success('Đăng xuất thành công');
      navigate('/');
    }
  };

  const handleEmpty = () => {
    handleFull();
  };

  const handleRepair = () => {
    handelRepair();
  };

  const getNotification = async () => {
    let success = false;  
    while (!success) {   
      try {
        console.log("userPhone: ", phone);
        const response = await axios.get(`${url}/Notification/GetNotificationByPhoneNumber?phoneNumber=${phone}`);   
        const NotificationsData = response.data;
        console.log("NotificationsData: ", NotificationsData);
      
        // Kiểm tra nếu dữ liệu nhận được hợp lệ
        if (NotificationsData) {    
          const sortedData = NotificationsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

          const uniqueNotifications = sortedData.reduce((acc, item) => {  
            const exists = acc.find((t) => t.title === item.title && t.timestamp === item.timestamp);
            if (!exists) {
              acc.push(item); // Chỉ thêm vào danh sách nếu chưa có
            }
            return acc;
          }, []);

          // Đếm số lượng thông báo chưa đọc
          const unreadCount = uniqueNotifications.filter((item) => item.isAcknowledge === false).length;
          setUnreadCount(unreadCount)                     
          setListNotifications(uniqueNotifications); 
        
          success = true; // Dừng vòng lặp khi dữ liệu hợp lệ và được xử lý
        } else {
          alert('ReLoad');
        }
      } catch (error) {
        console.error('getNotification error, retrying...', error);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 2 giây trước khi thử lại
      }
    }
  };

  useEffect(() => {  
    const phoneNumer = sessionStorage.getItem('phoneNumber');    
    setPhone(phoneNumer) 
  }, [])

  useEffect(() => {   
    if(phone !== ''){
        getNotification(); 
    }                     
  }, [phone])

  return (
    <>
      {(user && user.auth || currentPath === '/') && (
        <div className="nav-links">
          <div className={`nav-links-container ${showCollection ? 'collection-active' : ''}`}>
            <div className="nav-links-container-item center">
              <Link to="/map">
                <div onClick={toggleShowCollection}>
                  <div>Bản đồ</div>
                </div>
              </Link>
            </div>

            <div className="nav-links-container-item center">
              <Link to="/map">
                <div onClick={handleShowPercentBattery}>
                  <div>Thay Pin</div>
                </div>
              </Link>
            </div>
            {showPercentBattery && (
              <div className="nav-links-container-item center">
                <div className="wrapBattery">
                  <div className="wrapBatteryItem">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={valueBattery}
                      onChange={handleChangeBattery}
                    />
                    <div>{`< ${valueBattery}%`}</div>
                  </div>
                  <div className="wrapBatteryItem">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleSelectPercentBattery}
                    >
                      Chọn
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={triggerDisplayBatteryRoute}
                    >
                      Vẽ đường đi
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="nav-links-container-item center">
              <Link to="/bin">Danh sách</Link>
            </div>
            <div className="nav-links-container-item center">
              <Link to="/setting/GPS">GPS</Link>
            </div>
            <div className="nav-links-container-item center">
              <Link to="/setting/Object">Object</Link>
            </div>
            <div className="nav-links-container-item center">
              <Link to="/report/collection">Thu gom</Link>
            </div>
            <div className="nav-links-container-item center">
              <Link to="/report/warning">Cảnh báo</Link>
            </div>

            <div className="nav-links-container-item center">
              <Link to="/Notification">
                <div className={`notification-item ${unreadCount === 0 ? 'centered' : ''}`}>
                  <span>Thông báo</span>
                  {unreadCount > 0 && (
                    <span className="notificationBadge">{unreadCount}</span>
                  )}
                </div>
              </Link>
            </div>

            <div className="nav-links-container-item center">
              <div onClick={handleLogout}>
                <RiLogoutCircleRLine className="iconLogout" /> Đăng xuất
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;