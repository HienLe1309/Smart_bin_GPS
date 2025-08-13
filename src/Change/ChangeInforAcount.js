import React, { useState, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { UserContext } from '../context/usercontext';
import { toast } from 'react-toastify';
import { url } from '../services/UserService';

function ChangeInforAccount({ show, handleClose, userName, Userdata }) {
  const { UserLogin, setUserLogin } = useContext(UserContext);
  const [newName, setNewName] = useState(UserLogin?.name || "");

  const handleSave = async () => {
    if (newName.trim() === "") {
      toast.error("Tên tài khoản không được để trống!");
      return;
    }
  
    try {
      const response = await fetch(`${url}/User/UpdateUserInfomation?userName=${encodeURIComponent(userName)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Add token if required: 'Authorization': `Bearer ${UserLogin.token}`,
        },
        body: JSON.stringify({
          id: Number(Userdata.id),
          name: newName,
          userName: Userdata.userName,
          password: Userdata.password,
          point: Userdata.point,
          identificationNumber: Userdata.identificationNumber,
          sex: Userdata.sex,
          birthday: Userdata.birthday,
          homeTown: Userdata.homeTown,
          issuanceDate: Userdata.issuanceDate
        }),
      });
  
      if (response.ok) {
        const contentType = response.headers.get('Content-Type');
        let updatedUser;
        if (contentType && contentType.includes('application/json')) {
          updatedUser = await response.json();
          setUserLogin((prev) => ({
            ...prev,
            name: updatedUser.name || newName, // Fallback to newName if JSON doesn't include name
          }));
        } else {
          console.log('Server response (text):', await response.text());
          setUserLogin((prev) => ({
            ...prev,
            name: newName, // Use input value
          }));
        }
  
        toast.success("Tên tài khoản đã được cập nhật!");
        handleClose();
      } else {
        const errorData = await response.text();
        toast.error(`Cập nhật thất bại: ${errorData || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Error updating user information:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin!');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Thay đổi thông tin</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form>
          <div className="form-group">
            <label htmlFor="exampleInputName">Tên tài khoản</label>
            <input
              type="text"
              className="form-control"
              id="exampleInputName"
              placeholder="Nhập họ và tên"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}  // Cập nhật tên mới khi người dùng nhập
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Lưu
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ChangeInforAccount;
