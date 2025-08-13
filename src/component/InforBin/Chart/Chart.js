import React ,{useState} from 'react'
import './chart.scss'
import { useParams } from 'react-router-dom'
import DateTimePicker from 'react-datetime-picker';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {NavLink,Link} from "react-router-dom";
import {  toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import chart from '../../../asset/images/chart.png'
import history from '../../../asset/images/history.png'
import Table from 'react-bootstrap/Table';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import { BiSolidError } from "react-icons/bi";
import { FaCircle } from "react-icons/fa6";
import '../Header.scss'
function History() {
    const {id} = useParams()
    const [selectedDateFrom, setselectedDateFrom] = useState(null);
    const [selectedDateTo, setselectedDateTo] = useState(null);
    const [selectedDateOnly, setselectedDateOnly] = useState(null);
    const [valueFrom, onChangeFrom] = useState(new Date());
    const [valueTo, onChangeTo] = useState(new Date());
    return (
      <div className='fatherInfor'>
        <div className='header-bin'>
                <div className='header-bin-item'>
                    <Link  className='nav-link' to={`/bin/${id}/detail`}>Chi tiết</Link>
                </div>
                <div className='header-bin-item'>
                    <Link  className='nav-link' to={`/bin/${id}/data`}>Dữ liệu</Link>
                </div>         
        </div>  

        <div className='chart-container'>
              <div className='div-father-datetime'>
                <div className='father-datetime'>
                  <div>
                      <div>
                        Thời điểm bắt đầu
                      </div>
                      <div className="father-chart">
                        <DateTimePicker
                          onChange={onChangeFrom}
                          value={valueFrom}
                          format="dd/MM/yyyy HH:mm" // Định dạng cơ bản
                          disableCalendar={true} // Tắt lịch
                          disableClock={true} // Tắt đồng hồ
                          clearIcon={null} // Tắt nút xóa
                          calendarIcon={null} // Tắt biểu tượng lịch
                        />
                      </div>
                  </div>

                  <div>
                    <div>Thời điểm kết thúc</div>
                    <div className="father-chart">
                      <DateTimePicker
                        onChange={onChangeTo}
                        value={valueTo}
                        format="dd/MM/yyyy HH:mm" // Định dạng cơ bản
                        disableCalendar={true} // Tắt lịch
                        disableClock={true} // Tắt đồng hồ
                        clearIcon={null} // Tắt nút xóa
                        calendarIcon={null} // Tắt biểu tượng lịch
                      />
                    </div>
                  </div>

                  <div className='btn'>
                      <button type="button" class="btn btn-info">Xem</button>
                  </div>
                </div>                 
              </div>
              
              <div>
                <h1>
                  Thực phẩm
                </h1>               
              </div>      
              <div>
                    <button type="button" class="btn btn-info">PNG</button>
                    <div>
                        <img className='img' src={chart} alt=''/>
                    </div>
              </div> 
              <div className='pdf-excel'>
                      <button type="button" class="btn btn-danger">PDF</button>
                      <button type="button" class="btn btn-success">EXCEL</button>
              </div>
              <div className='table'>
              
                  <Table   bordered hover className='table'>
                      <thead>
                        <tr className='header-table'>
                            <th rowspan='2'>Thời gian</th>
                            <th rowspan='2'>Cảnh báo </th>
                            <th rowspan='2'> Kết nối</th>      
                            <th rowspan='2'>Năng lượng</th>
                            <td colspan="3" style={{ textAlign: 'center',fontWeight:'bold'}}>Mức đầy</td>
                            <th colspan="3" style={{ textAlign: 'center',fontWeight:'bold'}}>Số lần ép trong ngày</th>    
                        </tr>
                        <tr>
                             <th scope="col">Hữu cơ </th>
                             <th scope="col">Vô cơ tái chế được</th>
                             <th scope="col">Vô cơ không tái chế được </th>
                             <th scope="col">Hữu cơ</th>
                             <th scope="col">Vô cơ tái chế được</th>
                             <th scope="col">Vô cơ không tái chế được</th>          
                        </tr>
                      </thead>
                      <tbody>
                          <tr>
                             <th scope="col">24-5-2024 14:30:51</th>
                             <th scope="col" style={{ background: 'yellow',fontWeight:'bold'}}>Lỗi máy ép</th>
                             <th scope="col"><FaCircle className='connecting'/></th>
                             <th scope="col">100%</th>
                             <th scope="col" style={{ background: 'red',fontWeight:'bold'}} >HIGH</th>
                             <th scope="col">LOW</th>
                             <th scope="col">MEDIUM</th>
                             <th scope="col">10</th>          
                             <th scope="col">7</th>          
                             <th scope="col">6</th>          
                          </tr>
                          <tr>
                             <th scope="col">24-5-2024 14:31:51</th>
                             <th scope="col"></th>
                             <th scope="col"><FaCircle className='connecting'/></th>
                             <th scope="col">100%</th>
                             <th scope="col" style={{ background: 'red',fontWeight:'bold'}} >HIGH</th>
                             <th scope="col">LOW</th>
                             <th scope="col">MEDIUM</th>
                             <th scope="col">10</th>          
                             <th scope="col">7</th>          
                             <th scope="col">6</th>          
                          </tr>
                      </tbody>
                  </Table>
              </div>             
                <div>
                  <h1>
                    Tái chế
                  </h1>               
                </div> 
                <div>
                  <button type="button" class="btn btn-info">PNG</button>
                      <div>
                          <img className='img' src={chart} alt=''/>
                      </div>
                </div>
                <div className='pdf-excel'>
                      <button type="button" class="btn btn-danger">PDF</button>
                      <button type="button" class="btn btn-success">EXCEL</button>
                </div>

              <div className='table'>

                    
                    
                    
    <Table   bordered hover className='table'>
    <thead>
      <tr className='header-table'>
          <th rowspan='2'>Thời gian</th>
          <th rowspan='2'>Cảnh báo </th>
          <th rowspan='2'> Kết nối</th>      
          <th rowspan='2'>Năng lượng</th>
          <td colspan="3" style={{ textAlign: 'center',fontWeight:'bold'}}>Mức đầy</td>
          <th colspan="3" style={{ textAlign: 'center',fontWeight:'bold'}}>Số lần ép trong ngày</th>    
      </tr>
      <tr>
           <th scope="col">Hữu cơ </th>
           <th scope="col">Vô cơ tái chế được</th>
           <th scope="col">Vô cơ không tái chế được </th>
           <th scope="col">Hữu cơ</th>
           <th scope="col">Vô cơ tái chế được</th>
           <th scope="col">Vô cơ không tái chế được</th>          
      </tr>
    </thead>
    <tbody>
        <tr>
           <th scope="col">24-5-2024 14:30:51</th>
           <th scope="col" style={{ background: 'yellow',fontWeight:'bold'}}>Lỗi máy ép</th>
           <th scope="col"><FaCircle className='connecting'/></th>
           <th scope="col">100%</th>
           <th scope="col" style={{ background: 'red',fontWeight:'bold'}} >HIGH</th>
           <th scope="col">LOW</th>
           <th scope="col">MEDIUM</th>
           <th scope="col">10</th>          
           <th scope="col">7</th>          
           <th scope="col">6</th>          
        </tr>
    </tbody>
</Table>            
              </div>                 
              <div>
                <h1>
                  Khác
                </h1>               
              </div> 

              <div>
                <button type="button" class="btn btn-info">PNG</button>
                    <div>
                        <img className='img' src={chart} alt=''/>
                    </div>
              </div>   

                <div className='pdf-excel'>
                      <button type="button" class="btn btn-danger">PDF</button>
                      <button type="button" class="btn btn-success">EXCEL</button>
              </div>

              <div className='table'>
                    
              
                    <Table   bordered hover className='table'>
    <thead>
      <tr className='header-table'>
          <th rowspan='2'>Thời gian</th>
          <th rowspan='2'>Cảnh báo </th>
          <th rowspan='2'> Kết nối</th>      
          <th rowspan='2'>Năng lượng</th>
          <td colspan="3" style={{ textAlign: 'center',fontWeight:'bold'}}>Mức đầy</td>
          <th colspan="3" style={{ textAlign: 'center',fontWeight:'bold'}}>Số lần ép trong ngày</th>    
      </tr>
      <tr>
           <th scope="col">Hữu cơ </th>
           <th scope="col">Vô cơ tái chế được</th>
           <th scope="col">Vô cơ không tái chế được </th>
           <th scope="col">Hữu cơ</th>
           <th scope="col">Vô cơ tái chế được</th>
           <th scope="col">Vô cơ không tái chế được</th>          
      </tr>
    </thead>
    <tbody>
        <tr>
           <th scope="col">24-5-2024 14:30:51</th>
           <th scope="col" style={{ background: 'yellow',fontWeight:'bold'}}>Lỗi máy ép</th>
           <th scope="col"><FaCircle className='connecting'/></th>
           <th scope="col">100%</th>
           <th scope="col" style={{ background: 'red',fontWeight:'bold'}} >HIGH</th>
           <th scope="col">LOW</th>
           <th scope="col">MEDIUM</th>
           <th scope="col">10</th>          
           <th scope="col">7</th>          
           <th scope="col">6</th>          
        </tr>
    </tbody>
</Table>              
              </div>                
      </div>  
</div> 
  )
}

export default History
