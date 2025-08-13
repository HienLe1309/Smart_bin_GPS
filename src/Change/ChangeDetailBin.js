import React, { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { editUser } from '../services/UserService';
import {  toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
function ChangeDetailBin({ show , handleClose, upDateInforEditBin , binEdit }) {
  const navigate = useNavigate();
    const [district,setDistrict]= useState('')
    const [street,setStreet]= useState('')
    const [dateInstall,setdateInstall]= useState('')
    const [dateMaintenance,setDateMaintenance]= useState('')
    const [status,setstatus]= useState('')

    const handleEditBin = async () => {

      let res = await axios.put(`http://localhost:3001/cities/${binEdit.id}`,{...binEdit,
      street_name:street,
      district_name:district,
      installation_date:dateInstall,
      maintenance_date:dateMaintenance,
      status:status
    })
          
      if(res){    
          handleClose()
          toast.success('Chỉnh sửa thông tin thành công')
          upDateInforEditBin({
                                      ...binEdit,
                                      street_name:street,
                                      district_name:district,
                                      installation_date:dateInstall,
                                      maintenance_date:dateMaintenance,
                                     
                                      status:status
                              })
      }
      else{
          toast.error('Không thể chỉnh sửa thông tin thùng rác')
      }
  }
    useEffect(()=>{

      if(show){
          setStreet(binEdit.street_name)
          setDistrict(binEdit.district_name)
          setdateInstall(binEdit.installation_date)
          setDateMaintenance(binEdit.maintenance_date)
       
          setstatus(binEdit.status)
      }
      
  },[])

  const handleChangeStatus=()=>{
          if(status==='repair'){
            setstatus('normal')
          }
          else{
            setstatus('repair')
          }
  }
  return (
    <div  className="modal show"
      style={{ display: 'block', position: 'initial' }}>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Change Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <form>
            <div className="form-group">
              <label for="exampleInputJob">Quận : </label>
              <input type="text" className="form-control" id="exampleInputJob" placeholder="Quận"  
                    value={district}
                    onChange={(e)=>setDistrict(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label for="exampleInputJob">Đường : </label>
              <input type="text" className="form-control" id="exampleInputJob" placeholder="Đường"  
                    value={street}
                    onChange={(e)=>setStreet(e.target.value)}
              />
            </div>
           
            <div className="form-group">
              <label for="exampleInputJob">Ngày sửa chữa gần nhất: </label>
              <input type="text" className="form-control" id="exampleInputJob" placeholder="Ngày sửa chữa gần nhất:"  
                      value={dateMaintenance}
                    onChange={(e)=>setDateMaintenance(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label for="exampleInputJob">Ngày lắp đặt: </label>
              <input type="text" className="form-control" id="exampleInputJob" placeholder="Ngày lắp đặt:"  
                      value={dateInstall}
                      onChange={(e)=>setdateInstall(e.target.value)}
              />
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked"
                      checked={status==='repair'? true : false}
                      onChange={handleChangeStatus}
                 />
                <label class="form-check-label" for="flexCheckChecked">
                    Repair
                </label>
            </div>
            
        </form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
                variant="secondary" 
                onClick={handleClose}
          >Close
          </Button>
          <Button 
                variant="primary"
                onClick={handleEditBin} 
          >Save
          </Button>  
        </Modal.Footer>
      </Modal>
    
    </div>
  )
}


export default ChangeDetailBin

