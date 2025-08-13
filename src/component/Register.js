//File đăng ký người dùng
import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { toast } from 'react-toastify';
import './register.scss'
import { url } from '../services/UserService'
// import Select from 'react-select';
function Register({ show , handleClose }) {
  

    const [name, setName] = useState('')
    const [userName, setuserName] = useState('')
    const [password, setpassword] = useState('')
    const [identificationNumber, setidentificationNumber] = useState('')
    const [sex, setsex] = useState('')
    const [birthday, setbirthday] = useState('')
    const [homeTown, sethomeTown] = useState('')
    const [issuanceDate, setissuanceDate] = useState('')
    const [user, setuser] = useState({name:''})
     
    

    const Subcribe = async () => {
      try {
        const response = await axios.post(`${url}/User/RegisterNewUser`, user );
        
        
        if(response.data = 'Registered successfully'){
                toast.success('Đăng kí thành công')
                handleClose()
        }
        else{
          toast.error('Đăng kí không thành công')
        }
         
      } catch (error) {
        toast.error('Đăng kí không thành công')
      }
  };

    const handleSubcribe = () => {

      setuser({
        name:name,
        userName:userName,
        password:password,
        identificationNumber:identificationNumber,
        sex:sex,
        birthday:birthday,
        homeTown:homeTown,
        issuanceDate:issuanceDate
      })
    }

    const provinces = [
      "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre",
      "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng",
      "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
      "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên",
      "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An",
      "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam",
      "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình",
      "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh",
      "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
    ];
    
    // // Chuyển đổi dữ liệu về dạng phù hợp với react-select
    // const options = provinces.map(province => ({ value: province, label: province }));    

    useEffect(()=>{
      if(user.name !==''){
        Subcribe()
      }

    },[user])


  return (
    <div  className="modal show"
      style={{ display: 'block', position: 'initial' }}>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body>    
            <div class="containerRegister">
              <div class="wrapperRegister">
                        <div class="title"><span>Đăng kí</span></div>
                        <div className='form'>
                          <div class="row">
                            <label for="name">Họ và tên</label>
                            <input 
                              id="name"
                              type="text" 
                              placeholder="Nhập họ và tên" 
                              value={name}
                              onChange={(e)=>setName(e.target.value)}
                            />
                          </div>

                          <div class="row">
                            <label for="userName">Tên tài khoản</label>
                            <input 
                              id="userName"
                              type="text" 
                              placeholder="Nhập tên tài khoản" 
                              value={userName}
                              onChange={(e)=>setuserName(e.target.value)}
                            />
                          </div>

                          <div class="row">
                            <label for="password">Mật khẩu</label>
                            <input 
                              id="password"
                              type="password" 
                              placeholder="Nhập mật khẩu" 
                              value={password}
                              onChange={(e)=>setpassword(e.target.value)}
                            />
                          </div>

                          <div class="row">
                            <label for="identificationNumber">Số CMND/CCCD/CC</label>
                            <input 
                              id="identificationNumber"
                              type="text" 
                              placeholder="Nhập số CMND/CCCD/CC" 
                              value={identificationNumber}
                              onChange={(e)=>setidentificationNumber(e.target.value)}
                            />
                          </div>

                          <div class="row">
                            <label for="sex">Giới tính</label>
                            <input 
                              id="sex"
                              type="text" 
                              placeholder="Nhập giới tính" 
                              value={sex}
                              onChange={(e)=>setsex(e.target.value)}
                            />
                          </div>

                          <div class="row">
                            <label for="birthday">Ngày sinh (tháng/ngày/năm)</label>
                            <input 
                              id="birthday"
                              type="date" 
                              value={birthday}
                              onChange={(e)=>setbirthday(e.target.value)}
                            />
                          </div>

                          {/* <div className="row">
                            <label htmlFor="homeTown">Quê quán</label>
                            <input 
                              id="homeTown"
                              type="text" 
                              placeholder="Nhập quê quán" 
                              value={homeTown}
                              onChange={(e)=>sethomeTown(e.target.value)}
                            />
                          </div> */}
                          <div className="row">
                            <label htmlFor="homeTown">Quê quán</label>
                            <input 
                              id="homeTown"
                              type="text" 
                              placeholder="Nhập quê quán" 
                              value={homeTown}
                              onChange={(e) => sethomeTown(e.target.value)}
                              list="provinces" // Kết nối với danh sách datalist
                              autoComplete="off"
                            />
                            <datalist id="provinces">
                              {provinces.map((province, index) => (
                                <option key={index} value={province} />
                              ))}
                            </datalist>
                          </div>

                          <div class="row">
                            <label for="issuanceDate">Ngày cấp (tháng/ngày/năm)</label>
                            <input 
                              id="issuanceDate"
                              type="date" 
                              value={issuanceDate}
                              onChange={(e)=>setissuanceDate(e.target.value)}
                            />
                          </div>

                          <div class="row button">
                            <button   
                              className='button-login'
                              onClick={handleSubcribe}
                            >        
                              Đăng kí
                            </button>
                          </div>
                        </div>
                </div>  
        </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
              Close
          </Button>
          
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Register
