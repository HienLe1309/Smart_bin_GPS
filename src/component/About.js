// import React from 'react'
// import imgAbout from '../asset/images/imageAbout.png'
// import imgAbout1 from '../asset/images/new_about.png'
// import './About.scss'
// import { IoPhonePortraitOutline } from "react-icons/io5";
// import { RiDeleteBin6Fill } from "react-icons/ri";
// import { IoIosGift } from "react-icons/io";
import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/usercontext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { url } from '../services/UserService';
import { processBinsAndUpdatePoints } from '../services/BinService';
import imgAbout from '../asset/images/imageAbout.png';
import imgAbout1 from '../asset/images/new_about.png';
import './About.scss';
import { IoPhonePortraitOutline } from "react-icons/io5";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { IoIosGift } from "react-icons/io";

function About() {

  return (
    <div className='About'> 
      <div className='AboutItem AboutItemImage'>
            <img src={imgAbout} alt="My Image"/>
      </div>
      <div className='AboutItem AboutItemTitle'>
            {/* Bạn có đang gặp khó khăn trong việc tìm kiếm thùng rác quanh bạn. */}
           I. Hướng dẫn phân loại rác tại nguồn 
      </div>
      <div className='AboutItem AboutItemScript'>
          <div className='DivAboutItemScript'>
Theo điều 75 Luật bảo vệ môi trường năm 2020, chất thải rắn sinh hoạt phát sinh từ hộ gia đình, cá nhân được phân thành 3 loại: chất thải rắn có khả năng tái sử dụng, tái chế; chất thải thực phẩm; chất thải rắn sinh hoạt khác. Dưới đây là hướng dẫn phân loại chất thải sinh hoạt: 
          </div>
      </div>
      <div className='AboutItem AboutItemIcon'>
          {/* <div className='DivAboutItemIcon'>
            <div className='Icon'>
                  <IoPhonePortraitOutline/>               
            </div>
            <div className='text'>
                Theo dõi vị trí
            </div>
          </div>
          <div className='DivAboutItemIcon'>
            <div className='Icon'>
                  <RiDeleteBin6Fill/>               
            </div>
            <div className='text'>
                Theo dõi mức đầy
            </div>
          </div>
          <div className='DivAboutItemIcon'>
            <div className='Icon'>
                  <IoIosGift/>               
            </div>
            <div className='text'>
                Tích điểm đổi quà
            </div>
          </div> */}
          <img src={imgAbout1} alt="My Image1"/>
      </div>
      
      <div className='AboutItem AboutItemTitle'>
      II. Hướng dẫn sử dụng phần mềm 
      </div>
        
      <div className='AboutItem AboutItemScript'>
          <div className='DivAboutItemScript'>
            <ol>
              <li>Đăng ký/ đăng nhập tài khoản </li>
              <li>Vào phần giới thiệu để xem hướng dẫn phân loại rác tại nguồn và hướng dẫn sử dụng phần mềm </li>
              <li>Vào phần bản đồ để chỉ đường đến thùng rác thông minh gần nhất </li>
              <li>Vào phần tài khoản để xem thông tin tài khoản hoặc cập nhật lại thông tin tài khoản </li>
              <li>Vào phần lịch sử điểm để xem lịch sử tích điểm/đổi điểm </li>
              <li>Chọn đăng xuất để thoát </li>
            </ol>
          </div>
      </div>
    </div>
  )
}

export default About
