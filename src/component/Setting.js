import React,{useState} from 'react'
import './setting.scss'

import ChangeInforLogin from '../Change/ChangeInforLogin'

function Setting() {
    const [showChangeLogin, setshowChangeLogin] = useState(false)
    const handleshowModalChangeLogin= ()=> {
      setshowChangeLogin(true)
    }
    const handleCloseModalChangeLogin=()=>{
      setshowChangeLogin(false)
    }
  return (
    <div className='father'>
      <div className='father-wrapper'>
        <div className='loginInformation'>
          <div className='loginInformation-title'>Thông tin đăng nhập</div>
          <div className='loginInformation-main'>
            <div className='loginInformation-main-first'>
              <div className='label'>Email</div>
              <div className='value'>degea14012003@gmail.com</div>
            </div>
            <div className='loginInformation-main-second'>
              <div className='label'>Mật khẩu</div>
              <div className='value'>bkhcmut</div>
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
        />
       
      </div>
    </div>
  )
}

export default Setting
