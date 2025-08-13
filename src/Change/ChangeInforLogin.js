// 
import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { url } from '../services/UserService';

function ChangeInforLogin({ show, handleClose, userName, token }) {
  // State để điều khiển hiển thị mật khẩu (ẩn/hiện)
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // State để lưu dữ liệu nhập vào
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  // console.log(userName)

  // Toggle hiển thị mật khẩu cho từng input
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Xử lý sự thay đổi của input
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Xử lý sự kiện lưu mật khẩu, gọi API cập nhật mật khẩu
  const handleSave = async () => {
    const { oldPassword, newPassword, confirmPassword } = formData;
    console.log(formData)
    // Kiểm tra mật khẩu mới và xác nhận có khớp không
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }

    try {
      // Gọi API cập nhật mật khẩu (thay URL và phương thức phù hợp)
      const response = await fetch(`${url}/User/ChangePasswordByUserName?userName=${encodeURIComponent(userName)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Thêm token hoặc các header khác nếu cần
        },
        body: JSON.stringify({
          currentPassword: oldPassword,
          newPassword,
        }),
      });
      const text = await response.text();
      // console.log('Server raw response:', text);
      // console.log('API URL:', `https://smartbinapi.azurewebsites.net/User/ChangePasswordByUserName?userName=${userName}`);

      if (response.ok) {
        // Nếu cập nhật thành công
        alert('Cập nhật mật khẩu thành công!');
        handleClose();
      } else {
        // Nếu có lỗi từ server
        const errorData = await response.json();
        alert(`Cập nhật mật khẩu thất bại: ${errorData.message || 'Lỗi không xác định'}`);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Có lỗi xảy ra khi cập nhật mật khẩu!');
    }
  };

  return (
    <div className="modal show" style={{ display: 'block', position: 'initial' }}>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Thay đổi mật khẩu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="form-group">
              <label htmlFor="oldPassword">Mật khẩu cũ</label>
              <div className="input-group">
                <input
                  type={showPasswords.oldPassword ? 'text' : 'password'}
                  className="form-control"
                  id="oldPassword"
                  placeholder="Nhập mật khẩu cũ"
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                />
                <div className="input-group-append">
                  <span
                    className="input-group-text"
                    style={{ cursor: 'pointer' }}
                    onClick={() => togglePasswordVisibility('oldPassword')}
                  >
                    {showPasswords.oldPassword ? '👁️' : '🔒'}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <div className="input-group">
                <input
                  type={showPasswords.newPassword ? 'text' : 'password'}
                  className="form-control"
                  id="newPassword"
                  placeholder="Nhập mật khẩu mới"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                />
                <div className="input-group-append">
                  <span
                    className="input-group-text"
                    style={{ cursor: 'pointer' }}
                    onClick={() => togglePasswordVisibility('newPassword')}
                  >
                    {showPasswords.newPassword ? '👁️' : '🔒'}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
              <div className="input-group">
                <input
                  type={showPasswords.confirmPassword ? 'text' : 'password'}
                  className="form-control"
                  id="confirmPassword"
                  placeholder="Xác nhận mật khẩu mới"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <div className="input-group-append">
                  <span
                    className="input-group-text"
                    style={{ cursor: 'pointer' }}
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    {showPasswords.confirmPassword ? '👁️' : '🔒'}
                  </span>
                </div>
              </div>
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
    </div>
  );
}

export default ChangeInforLogin;
