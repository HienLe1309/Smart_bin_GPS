import { Route,Routes } from 'react-router-dom';
import React from 'react'
import Map from '../component/Map';
import Bin from '../component/Bin';
import './routes.scss'
import Setting from '../component/Setting';
import Register from '../component/Register';
import Chart from '../component/InforBin/Chart/Chart';
import Detail from '../component/InforBin/Detail/Detail';
import AddNewBin from '../component/AddNewBin/AddNewBin';
import Updatebin from '../component/UpdateBin/UpdateBin';
import Collection from '../component/Report/Collection';
import Warning from '../component/Report/Warning';
import Thongke from '../component/Report/thongke';
import Login from '../component/Login';
import { ToastContainer } from 'react-toastify';
import { UserContext } from '../context/usercontext';
import { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TotalLogin from '../component/TotalLogin';
import { useNavigate, useLocation  } from 'react-router-dom';
import LoginAdminBin from '../component/LoginAdminBin';
import LoginAdminUser from '../component/LoginAdminUser';
import MapUser from '../component/MapUser';
import SettingUser from '../component/SettingUser';
import About from '../component/About';
import PointUser from '../component/PointUser';
import ListUsers from '../component/ListUsers';
import User from '../component/User'
import GPS from '../component/GPS'
import SettingGPS from '../component/SettingGPS'
import DetailGPS from '../component/DetailGPS'
import PositionGPS from '../component/PositionGPS';
import HistoryGPS from '../component/HistoryGPS';
import Object from '../component/Object'
import AddObject from '../component/AddObject';
import PositionObject from '../component/PositionObject';
import HistoryObject from '../component/HistoryObject';
import DetailObject from '../component/DetailObject';
import Notification from '../component/Notification';
function AppRoutes() {  

  const { user , loginContext, token, setToken, loginTotalLogin, logoutTotalLogin, LoginTotal } = useContext(UserContext);
  const {id} = useParams()
  const navigate = useNavigate();
  
  useEffect(()=>{
    const emailSessionStorage = sessionStorage.getItem('email');
    const tokenSessionStorage = sessionStorage.getItem('token');
    

    if(emailSessionStorage){
      loginContext(emailSessionStorage,tokenSessionStorage)
      setToken(tokenSessionStorage)
    }
    
  },[])


  return (
    <div className='routes'>
            <Routes>
                <Route path="/loginUser" element={ <Login/>} />
                <Route path="/loginAdminBin" element={ <LoginAdminBin/>} />
                <Route path="/loginAdminUser" element={ <LoginAdminUser/>} />
                {user && user.auth && LoginTotal === 'AdminBin' ? <Route path="/map" element={ <Map/>} /> : '' }
                {user && user.auth && LoginTotal === 'User' ? <Route path="/map" element={ <MapUser/>} /> : '' }
                {user && user.auth && LoginTotal === 'User' ? <Route path="/about" element={ <About/>} /> : '' }
                {user && user.auth && LoginTotal === 'User' ? <Route path="/historypoint" element={ <PointUser/>} /> : '' }

                {user && user.auth && LoginTotal === 'AdminUser' ? <Route path="/listUser" element={ <ListUsers/>} /> : '' }
                {user && user.auth && LoginTotal === 'AdminUser' ? <Route path="/user/:id" element={ <User/>} />   : '' }
               
                {user && user.auth && LoginTotal === 'AdminBin' ? <Route path="/bin" element={ <Bin/>} /> : '' }
                {user && user.auth && LoginTotal === 'AdminBin' ? <Route path="/setting" element={ <Setting/>} /> : '' }
                {user && user.auth && LoginTotal === 'AdminBin' ? <Route path="/setting/GPS" element={ <GPS/>} /> : '' }
                {user && user.auth && LoginTotal === 'AdminBin' ? <Route path="/setting/Object" element={ <Object/>} /> : '' }
                {user && user.auth && LoginTotal === 'AdminBin' ? <Route path="/Notification" element={<Notification/>} /> : '' } 
                {user && user.auth  ? <Route path="/settingUser" element={ <SettingUser/>} /> : '' }
                {user && user.auth ? <Route path="/report/collection" element={ <Collection/>} /> : '' }
                {user && user.auth ? <Route path="/report/warning" element={ <Warning/>} /> : '' }
                {user && user.auth ? <Route path="/report/statistic" element={ <Thongke/>} /> : '' }
                {/* {user && user.auth ? <Route path="/register" element={ <Register/>} /> : '' } */}
                {user && user.auth ? <Route path="/bin/:id/data" element={<Chart/>} /> : '' }
                {user && user.auth && LoginTotal === 'AdminBin' ? <Route path="/bin/:id/detail" element={<Detail/>} /> : '' }
                {user && user.auth && LoginTotal === 'AdminBin' ? <Route path="/addnewbin" element={<AddNewBin/>} /> : '' }
                {user && user.auth && LoginTotal === 'AdminBin' ? <Route path="/bin/:id/detail/update" element={<Updatebin/>} /> : '' } 
                {user && user.auth ? <Route path="/GPS/Setting/:id" element={<SettingGPS/>}/> : '' }
                {user && user.auth ? <Route path="/GPS/Setting/:id/Detail" element={<DetailGPS/>} /> : '' }
                {user && user.auth ? <Route path="/GPS/Position/:id" element={<PositionGPS/>} /> : '' }
                {user && user.auth ? <Route path="/HistoryGPS/:id" element={<HistoryGPS/>} /> : '' }
                {user && user.auth ? <Route path="/AddObject" element={<AddObject/>} /> : '' }
                {user && user.auth ? <Route path="/PositionObject/:id" element={<PositionObject/>} /> : '' }
                {user && user.auth ? <Route path="/HistoryObject/:id" element={<HistoryObject/>} /> : '' }
                {user && user.auth ? <Route path="/Object/Setting/:id" element={<DetailObject/>} /> : '' }
            </Routes>          
    </div>
  )
}

export default AppRoutes
