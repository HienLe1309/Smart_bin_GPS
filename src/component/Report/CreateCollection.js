import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import DateTimePicker from 'react-datetime-picker';
import axios from 'axios';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import './collection.scss'; // Reuse existing styles

function CreateCollection() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    binId: '',
    district: 'Quận/Huyện',
    street: '',
    binType: 'Loại thùng',
    collectionTime: new Date(),
  });

  // District list from AddNewBin.js
  const districts = [
    'Quận/Huyện',
    'Quận 1',
    'Quận 2',
    'Quận 3',
    'Quận 4',
    'Quận 5',
    'Quận 6',
    'Quận 7',
    'Quận 8',
    'Quận 9',
    'Quận 10',
    'Quận 11',
    'Quận 12',
    'Bình Tân',
    'Bình Thạnh',
    'Gò Vấp',
    'Phú Nhuận',
    'Tân Bình',
    'Tân Phú',
    'Thủ Đức',
    'Bình Chánh',
    'Cần Giờ',
    'Củ Chi',
    'Hóc Môn',
    'Nhà Bè',
  ];

  // Bin types
  const binTypes = ['Loại thùng', 'Không tái chế', 'Thực phẩm', 'Tái chế'];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle collection time change
  const handleCollectionTimeChange = (date) => {
    setFormData({ ...formData, collectionTime: date });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validation
      if (!formData.binId) {
        toast.error('Vui lòng nhập ID thùng rác');
        return;
      }
      if (formData.district === 'Quận/Huyện') {
        toast.error('Vui lòng chọn quận');
        return;
      }
      if (!formData.street) {
        toast.error('Vui lòng nhập đường');
        return;
      }
      if (formData.binType === 'Loại thùng') {
        toast.error('Vui lòng chọn loại thùng');
        return;
      }
      if (!formData.collectionTime) {
        toast.error('Vui lòng chọn thời điểm thu gom');
        return;
      }

      // Combine district and street into address
      const address = `${formData.district}, ${formData.street}`;

      // Prepare API payload
      const payload = {
        binId: formData.binId,
        address,
        binType: formData.binType,
        collectionTime: formData.collectionTime.toISOString(),
      };

      // Send to API
      const response = await axios.post(
        'https://smartbinapi.azurewebsites.net/Collections/CreateCollection',
        payload
      );

      if (response && response.data) {
        toast.success('Tạo danh sách thu gom thành công');
        // Navigate back to collection list with new schedule
        navigate('/report/collection', {
          state: {
            newCollection: {
              binId: formData.binId,
              district: formData.district,
              street: formData.street,
              collectionTime: formatDate(formData.collectionTime),
            },
          },
        });
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error(
        'Không thể tạo danh sách thu gom: ' +
          (error.response ? JSON.stringify(error.response.data.errors || error.response.data) : error.message)
      );
    }
  };

  // Format date to DD-MM-YYYY HH:mm:ss
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="father-detail">
      <h2>Tạo danh sách thu gom</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>ID Thùng Rác</Form.Label>
          <Form.Control
            type="text"
            name="binId"
            value={formData.binId}
            onChange={handleInputChange}
            placeholder="Nhập ID thùng rác"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Quận</Form.Label>
          <Form.Select
            name="district"
            value={formData.district}
            onChange={handleInputChange}
          >
            {districts.map((district, index) => (
              <option key={index} value={district}>
                {district}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Đường</Form.Label>
          <Form.Control
            type="text"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            placeholder="Nhập đường"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Loại thùng</Form.Label>
          <Form.Select
            name="binType"
            value={formData.binType}
            onChange={handleInputChange}
          >
            {binTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Thời điểm thu gom</Form.Label>
          <div className="father-chart">
            <DateTimePicker
              onChange={handleCollectionTimeChange}
              value={formData.collectionTime}
              format="dd/MM/yyyy HH:mm"
              disableCalendar={true}
              disableClock={true}
              clearIcon={null}
              calendarIcon={null}
            />
          </div>
        </Form.Group>

        <Button variant="primary" type="submit">
          Tạo
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/report/collection')}
          style={{ marginLeft: '10px' }}
        >
          Hủy
        </Button>
      </Form>
    </div>
  );
}

export default CreateCollection;