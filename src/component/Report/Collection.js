import React, { useState, useEffect } from 'react';
import './collection.scss';
import { useParams } from 'react-router-dom';
import DateTimePicker from 'react-datetime-picker';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { NavLink, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import collection from '../../asset/images/lichsuthugom.png';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import Table from 'react-bootstrap/Table';
import axios from 'axios';
import { url } from '../../services/UserService';

function Collection() {
  const { id } = useParams();
  const [valueFrom, onChangeFrom] = useState(new Date());
  const [valueTo, onChangeTo] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedCollections, setDisplayedCollections] = useState([]);

  // State for the new collection form
  const [newCollection, setNewCollection] = useState({
    binId: '',
    district: 'Quận/Huyện',
    street: '',
    binType: 'Loại thùng',
    collectionTime: new Date(),
  });

  // State for the collection schedules table
  const [originalCollections, setOriginalCollections] = useState([]);
  const [collections, setCollections] = useState([]);

  // State for modal visibility
  const [showModal, setShowModal] = useState(false);

  // District list
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCollection({ ...newCollection, [name]: value });
  };

  // Handle collection time change
  const handleCollectionTimeChange = (date) => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      setNewCollection({ ...newCollection, collectionTime: date });
    } else {
      toast.error('Thời điểm thu gom không hợp lệ');
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

  // Handle form submission
  const handleCreateCollection = async () => {
    try {
      // Validation
      if (!newCollection.binId) {
        toast.error('Vui lòng nhập ID thùng rác');
        return;
      }
      if (newCollection.district === 'Quận/Huyện') {
        toast.error('Vui lòng chọn quận');
        return;
      }
      if (!newCollection.street) {
        toast.error('Vui lòng nhập đường');
        return;
      }
      if (newCollection.binType === 'Loại thùng') {
        toast.error('Vui lòng chọn loại thùng');
        return;
      }
      if (!newCollection.collectionTime) {
        toast.error('Vui lòng chọn thời điểm thu gom');
        return;
      }

      // Ensure collectionTime is a valid Date object
      const collectionTime = new Date(newCollection.collectionTime);
      if (isNaN(collectionTime.getTime())) {
        toast.error('Thời điểm thu gom không hợp lệ');
        return;
      }

      // Prepare API payload
      const payload = {
        binId: newCollection.binId,
        district: newCollection.district,
        street: newCollection.street,
        binType: newCollection.binType,
        collectedTime: collectionTime.toISOString(), // Sử dụng collectedTime để khớp với API
      };
      console.log('Payload being sent:', payload); // Log để kiểm tra

      // Send to API
      const response = await axios.post(`${url}/CollectedHistories/CreateCollectedHistory`,
        payload
      );

      if (response && response.data) {
        // Add to table
        const newItem = {
          binId: newCollection.binId,
          address: newCollection.street,
          binType: newCollection.binType,
          collectionTime: newCollection.collectionTime,
        };
        setOriginalCollections([...originalCollections, newItem]);
        setCollections([...collections, newItem]);
        setDisplayedCollections([...collections, newItem]);

        // Reset form and close modal
        setNewCollection({
          binId: '',
          district: 'Quận/Huyện',
          street: '',
          binType: 'Loại thùng',
          collectionTime: new Date(),
        });
        setShowModal(false);

        toast.success('Tạo danh sách thu gom thành công');
      }
    } catch (error) {
      const errorMessage = error.response
        ? JSON.stringify(error.response.data.errors || error.response.data)
        : error.message;
      console.error('API error response:', error.response ? error.response.data : error);
      toast.error('Không thể tạo danh sách thu gom: ' + errorMessage);
    }
  };

  // Handle filtering by time range
  const handleFilterCollections = () => {
    if (!valueFrom || !valueTo) {
      toast.error('Vui lòng chọn thời điểm bắt đầu và kết thúc');
      return;
    }

    const filtered = originalCollections.filter((item) => {
      const collectionDate = new Date(item.collectionTime);
      return collectionDate >= valueFrom && collectionDate <= valueTo;
    });

    setCollections(filtered);
    setDisplayedCollections(filtered);

    if (filtered.length === 0) {
      toast.info('Không tìm thấy dữ liệu trong khoảng thời gian đã chọn');
    }
  };

  // Handle search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setDisplayedCollections(collections);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = collections.filter((item) => {
      return (
        item.binId.toLowerCase().includes(lowerCaseQuery) ||
        item.binType.toLowerCase().includes(lowerCaseQuery) ||
        item.address.toLowerCase().includes(lowerCaseQuery) ||
        formatDate(item.collectionTime).toLowerCase().includes(lowerCaseQuery)
      );
    });

    setDisplayedCollections(filtered);

    if (filtered.length === 0) {
      toast.info('Không tìm thấy kết quả phù hợp');
    }
  };

  // Handle key press for search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Fetch initial data from GetAllBins API
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get(`${url}/Bins/GetAllBins`);
        const bins = response.data;

        // Flatten binUnits and their collectedHistories into a collection list
        const fetchedCollections = bins.flatMap((bin) =>
          bin.binUnits.flatMap((unit) =>
            (unit.collectedHistories || []).map((history) => ({
              binId: bin.id,
              address: bin.address,
              binType: unit.binUnitId,
              collectionTime: new Date(history.collectedTime),
            }))
          )
        );

        setOriginalCollections(fetchedCollections);
        setCollections(fetchedCollections);
        setDisplayedCollections(fetchedCollections);
      } catch (error) {
        console.error('Error fetching bins:', error);
        toast.error('Không thể tải danh sách thu gom');
      }
    };
    fetchCollections();
  }, []);

  return (
    <div className="father-detail">
      <div className="div-father-collection">
        <div className="input-group">
          <div className="form-outline">
            <input
              type="search"
              id="form1"
              className="form-control"
              placeholder="Tìm theo Bin ID, Loại thùng, Địa chỉ hoặc Thời điểm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button type="button" className="btn btn-primary" onClick={handleSearch}>
              <i className="fas fa-search"></i>
            </button>
          </div>

          <div>
            <div>Thời điểm bắt đầu</div>
            <div className="father-chart">
              <DateTimePicker
                onChange={onChangeFrom}
                value={valueFrom}
                format="dd/MM/yyyy HH:mm"
                disableCalendar={true}
                disableClock={true}
                clearIcon={null}
                calendarIcon={null}
              />
            </div>
          </div>

          <div>
            <div>Thời điểm kết thúc</div>
            <div className="father-chart">
              <DateTimePicker
                onChange={onChangeTo}
                value={valueTo}
                format="dd/MM/yyyy HH:mm"
                disableCalendar={true}
                disableClock={true}
                clearIcon={null}
                calendarIcon={null}
              />
            </div>
          </div>

          <div className="btn-see">
            <Button variant="primary" onClick={handleFilterCollections}>
              Xem
            </Button>
          </div>
        </div>

        {/* Create Collection Button */}
        <div style={{ marginTop: '20px' }}>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Tạo lịch sử thu gom
          </Button>
        </div>

        {/* Modal for New Collection Form */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Tạo lịch sử thu gom</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>ID Thùng Rác</Form.Label>
                <Form.Control
                  type="text"
                  name="binId"
                  value={newCollection.binId}
                  onChange={handleInputChange}
                  placeholder="Nhập ID thùng rác"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Quận</Form.Label>
                <Form.Select
                  name="district"
                  value={newCollection.district}
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
                  value={newCollection.street}
                  onChange={handleInputChange}
                  placeholder="Nhập đường"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Loại thùng</Form.Label>
                <Form.Select
                  name="binType"
                  value={newCollection.binType}
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
                    value={newCollection.collectionTime}
                    format="dd/MM/yyyy HH:mm"
                    disableCalendar={true}
                    disableClock={true}
                    clearIcon={null}
                    calendarIcon={null}
                  />
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleCreateCollection}>
              Lưu
            </Button>
          </Modal.Footer>
        </Modal>

        <div className="table">
          <Table striped bordered hover className="table">
            <thead>
              <tr>
                <th>Bin ID</th>
                <th>Địa chỉ</th>
                <th>Loại thùng</th>
                <th>Thời điểm thu gom</th>
              </tr>
            </thead>
            <tbody>
              {displayedCollections.map((item, index) => (
                <tr key={index}>
                  <td>{item.binId}</td>
                  <td>{item.address}</td>
                  <td>{item.binType}</td>
                  <td>{formatDate(item.collectionTime)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default Collection;