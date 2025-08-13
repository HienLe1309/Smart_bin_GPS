import './App.scss';
import Header from './component/Header';
import Container from 'react-bootstrap/Container';
import { ToastContainer } from 'react-toastify';
import { UserContext } from './context/usercontext';
import { useContext, useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { useParams } from 'react-router-dom';
import Login from './component/Login';
import TotalLogin from './component/TotalLogin';
import { useNavigate, useLocation  } from 'react-router-dom';
import HeaderUser from './component/HeaderUser';
import HeaderAdminUser from './component/HeaderAdminUser';


function App() {
  const { user , loginContext, token, setToken, loginTotalLogin, logoutTotalLogin, LoginTotal } = useContext(UserContext);
  const {id} = useParams()
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if(location.pathname === '/'){     
      logoutTotalLogin()
    }
  
    const emailSessionStorage = sessionStorage.getItem('email');
    const tokenSessionStorage = sessionStorage.getItem('token');
    const LoginTotalSessionStorage = sessionStorage.getItem('totalLogin');

    if(emailSessionStorage) {
      loginContext(emailSessionStorage,tokenSessionStorage)
      setToken(tokenSessionStorage)
    }

    if(LoginTotalSessionStorage){
      loginTotalLogin(LoginTotalSessionStorage)
    }

  },[location])
  
  console.log('LoginTotal', LoginTotal)
  return (
  <div className='Container'>
     <div className="App-container">
          {user && user.auth && LoginTotal === 'AdminBin' ? <Header/> : ''}
          {user && user.auth && LoginTotal === 'User' ? <HeaderUser/> : ''}
          {user && user.auth && LoginTotal === 'AdminUser' ? <HeaderAdminUser/> : ''}
          {/* {user && user.auth ? <AppRoutes/> : ''} */}
          
          {LoginTotal === null ? <TotalLogin/> : ''  }

          <AppRoutes/>
          
          


          {/* {user && user.auth ?  '' : <TotalLogin/> } */}
          {/* {user && user.auth ? '' :  <Login/>} */}
    </div>
    <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
    />
  </div> 
  );
}

export default App;
