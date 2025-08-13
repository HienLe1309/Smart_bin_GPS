import React from 'react'
import './Thongke.scss'
import  {useState} from 'react'
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
import statistic from '../../asset/images/statistic.png'

import 'react-datepicker/dist/react-datepicker.css';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
function Thongke() {
    const {id} = useParams()
    const [selectedDateFrom, setselectedDateFrom] = useState(null);
    const [selectedDateTo, setselectedDateTo] = useState(null);
    const [selectedDateOnly, setselectedDateOnly] = useState(null);
    const [valueFrom, onChangeFrom] = useState(new Date());
    const [valueTo, onChangeTo] = useState(new Date());
  return (
    <div className='father-detail'>
        <div className='div-father-thongke'>
              <img className='img' src={statistic} alt=''/>
        </div>  
    </div> 
  )
}

export default Thongke
