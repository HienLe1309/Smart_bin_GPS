import React, { useEffect, useState, useRef, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import './Connect.scss';
import axios from 'axios';
import { url } from '../services/UserService';
import { UserContext } from '../context/usercontext';

function Connect({ show, handleClose }) {
  const { idObjectConnect, setidObjectConnect } = useContext(UserContext);
  const [fileName, setFileName] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [ObjectConnect, setObjectConnect] = useState({
    id: '',
    userPhoneNumber: '',
    name: '',
    longitude: 0,
    latitude: 0,
    address: '',
    description: '',
    imagePath: '',
    safeRadius: 0,
    currentTime: '0001-01-01T00:00:00',
    alarmTime: '0001-01-01T00:00:00',
    blueTooth: '',
    buzzer: '',
    sleep: false,
    threshold: 0,
    emergency: false,
  });
  const [loading, setLoading] = useState(false);
  const [loadingDisconnect, setLoadingDisconnect] = useState(false);
  const [listAllDevices, setlistAllDevices] = useState([]);
  const [Device, setDevice] = useState({ id: '', latitude: 0, longitude: 0, alarmTime: '', emergency: false });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('');
    }
  };

  const [image, setImage] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const startPosition = useRef({ x: 0, y: 0 });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (event) => {
    isDragging.current = true;
    startPosition.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
  };

  const handleMouseMove = (event) => {
    if (!isDragging.current) return;
    const newX = event.clientX - startPosition.current.x;
    const newY = event.clientY - startPosition.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const CallAPIGetObjectById = async () => {
    let success = false;
    let retries = 3;
    while (!success && retries > 0) {
      try {
        const response = await axios.get(`${url}/Bins/GetBinById?binId=${idObjectConnect}`);
        const LoggerData = response.data;

        if (LoggerData) {
          setObjectConnect({
            id: LoggerData.id || '',
            userPhoneNumber: LoggerData.userPhoneNumber || '',
            name: LoggerData.name || '',
            longitude: LoggerData.longitude || 0,
            latitude: LoggerData.latitude || 0,
            address: LoggerData.address || '',
            description: LoggerData.description || '',
            imagePath: LoggerData.imagePath || '',
            safeRadius: LoggerData.safeRadius || 0,
            currentTime: LoggerData.currentTime || '0001-01-01T00:00:00',
            alarmTime: LoggerData.alarmTime || '0001-01-01T00:00:00',
            blueTooth: LoggerData.blueTooth || '',
            buzzer: LoggerData.buzzer || '',
            sleep: LoggerData.sleep || false,
            threshold: LoggerData.threshold || 0,
            emergency: LoggerData.emergency || false,
          });
          console.log('ObjectConnect from API:', LoggerData);
          success = true;
        } else {
          toast.error('Không tìm thấy thông tin thùng rác');
        }
      } catch (error) {
        console.error('CallAPIGetObjectById error, retrying...', error);
        retries--;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    if (!success) {
      toast.error('Không thể lấy thông tin thùng rác sau nhiều lần thử');
    }
  };

  const callAPIConnecDevice = async () => {
    try {
      const phoneNumer = sessionStorage.getItem('phoneNumber');
      const response = await axios.patch(`${url}/Bins/SetupDeviceForBin`, {
        phoneNumber: phoneNumer,
        deviceId: selectedDevice,
        binId: idObjectConnect,
      });
      console.log('SetupDeviceForBin response:', response);

      if (response.data === 'Setup device for bin successfully!') {
        return true;
      } else {
        toast.error('Kết nối thiết bị không thành công');
        return false;
      }
    } catch (error) {
      console.error('callAPIConnecDevice error:', error);
      toast.error('Đăng kí không thành công');
      return false;
    }
  };

  const callAPIDisconnectDevice = async () => {
    try {
      setLoadingDisconnect(true);
      const phoneNumer = sessionStorage.getItem('phoneNumber');
      const response = await axios.patch(`${url}/Bins/SetupDeviceForBin`, {
        phoneNumber: phoneNumer,
        deviceId: '',
        binId: idObjectConnect,
      });
      console.log('DisconnectDevice response:', response);

      if (response.data === 'Setup device for bin successfully!') {
        await CallAPIGetObjectById();
        setSelectedDevice(null);
        toast.success('Xóa kết nối thiết bị thành công');
      } else {
        toast.error('Xóa kết nối thiết bị không thành công');
      }
    } catch (error) {
      console.error('callAPIDisconnectDevice error:', error);
      toast.error('Lỗi khi xóa kết nối thiết bị');
    } finally {
      setLoadingDisconnect(false);
    }
  };

  const callAPIUpdateObjectById = async (deviceData) => {
    const phoneNumer = sessionStorage.getItem('phoneNumber');
    let success = false;

    if (!deviceData.latitude || !deviceData.longitude) {
      console.error('Invalid device coordinates:', deviceData);
      toast.error('Tọa độ thiết bị không hợp lệ');
      return false;
    }

    while (!success) {
      try {
        const payload = {
          userPhoneNumber: phoneNumer,
          name: ObjectConnect.name || '',
          longitude: deviceData.longitude,
          latitude: deviceData.latitude,
          address: ObjectConnect.address || '',
          description: ObjectConnect.description || '',
          imagePath: ObjectConnect.imagePath || '',
          safeRadius: ObjectConnect.safeRadius || 0,
          currentTime: ObjectConnect.currentTime || '0001-01-01T00:00:00',
          alarmTime: deviceData.alarmTime || '0001-01-01T00:00:00',
          blueTooth: ObjectConnect.blueTooth || 'OFF',
          buzzer: ObjectConnect.buzzer || 'OFF',
          sleep: ObjectConnect.sleep || false,
          threshold: ObjectConnect.threshold || 0,
          emergency: deviceData.emergency || false,
        };
        console.log('UpdateBinById payload:', payload);
        const response = await axios.patch(`${url}/Bins/UpdateBinById?id=${idObjectConnect}`, payload);
        console.log('UpdateBinById full response:', response);

        // Chấp nhận cả hai phản hồi do lỗi chính tả trong API
        if (response.data === 'Update successfully!' || response.data === 'Update bin successfull!') {
          success = true;
          console.log('UpdateBinById response:', response.data);
          return true;
        } else {
          console.error('UpdateBinById failed with response:', response.data);
          toast.error(`Cập nhật thùng rác không thành công: ${response.data}`);
          return false;
        }
      } catch (error) {
        console.error('callAPIUpdateObjectById error:', error.response || error);
        toast.error(`Lỗi khi cập nhật thùng rác: ${error.response?.data || error.message}`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const getDeviceById = async () => {
    let success = false;
    while (!success) {
      try {
        const response = await axios.get(`${url}/GPSDevice/GetGPSDeviceById?Id=${selectedDevice}`);
        const DeviceData = response.data;
        console.log('Check DeviceData:', DeviceData);

        if (DeviceData && DeviceData.latitude != null && DeviceData.longitude != null && !isNaN(DeviceData.latitude) && !isNaN(DeviceData.longitude)) {
          const newDevice = {
            id: DeviceData.id || '',
            latitude: DeviceData.latitude,
            longitude: DeviceData.longitude,
            alarmTime: DeviceData.alarmTime || '0001-01-01T00:00:00',
            emergency: DeviceData.emergency || false,
          };
          setDevice(newDevice);
          console.log('DeviceData:', DeviceData);
          success = true;
          return newDevice;
        } else {
          console.warn('Invalid device coordinates:', DeviceData);
          toast.error('Thiết bị không có tọa độ hợp lệ');
          return null;
        }
      } catch (error) {
        console.error('getDeviceById error, retrying...', error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const handleConnectObjectWithDevice = async () => {
    if (!selectedDevice) {
      toast.error('Vui lòng chọn một thiết bị để kết nối');
      return;
    }

    try {
      setLoading(true);
      const deviceData = await getDeviceById();
      if (!deviceData) {
        throw new Error('Không lấy được dữ liệu thiết bị');
      }
      console.log('Device after getDeviceById:', deviceData);

      const connectSuccess = await callAPIConnecDevice();
      if (connectSuccess) {
        const updateSuccess = await callAPIUpdateObjectById(deviceData);
        if (updateSuccess) {
          // Thêm độ trễ để đảm bảo backend đồng bộ
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await CallAPIGetObjectById();
          toast.success('Kết nối với thiết bị thành công');
          setObjectConnect({
            id: '',
            userPhoneNumber: '',
            name: '',
            longitude: 0,
            latitude: 0,
            address: '',
            description: '',
            imagePath: '',
            safeRadius: 0,
            currentTime: '0001-01-01T00:00:00',
            alarmTime: '0001-01-01T00:00:00',
            blueTooth: '',
            buzzer: '',
            sleep: false,
            threshold: 0,
            emergency: false,
          });
          setSelectedDevice(null);
          handleClose();
        }
      }
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      toast.error('Lỗi khi kết nối thiết bị');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectDevice = async () => {
    if (!ObjectConnect.connected) {
      toast.error('Thùng rác hiện không được kết nối với thiết bị nào');
      return;
    }

    await callAPIDisconnectDevice();
  };

  const callAPIgetAllDevices = async () => {
    let success = false;
    while (!success) {
      try {
        const response = await axios.get(`${url}/GPSDevice/GetAllGPSDevices`);
        const LoggerData = response.data;

        if (LoggerData && LoggerData.length > 0) {
          const phoneNumer = sessionStorage.getItem('phoneNumber');
          const listDevice = LoggerData.filter((item) => item.userPhoneNumber === phoneNumer);
          setlistAllDevices(listDevice);
          console.log('listAllDevices:', listDevice);
          success = true;
        } else {
          console.log('No devices found');
        }
      } catch (error) {
        console.error('getAllDevices error, retrying...', error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  useEffect(() => {
    if (show) {
      CallAPIGetObjectById();
    }
  }, [show]);

  useEffect(() => {
    callAPIgetAllDevices();
  }, []);

  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
  };

  console.log('ObjectConnect:', ObjectConnect);
  console.log('Device:', Device);

  return (
    <div className="modal show" style={{ display: 'block', position: 'initial', zIndex: 1000 }}>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{`Kết nối đối tượng ${ObjectConnect.name}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="form-group">
              <label htmlFor="deviceSelect">Chọn thiết bị kết nối</label>
              <select
                id="deviceSelect"
                className="form-select"
                aria-label="Default select example"
                onChange={handleDeviceChange}
                value={selectedDevice || ''}
              >
                <option value="">-- Chọn thiết bị --</option>
                {listAllDevices.map((item, index) => (
                  <option key={index} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
          <Button
            variant="danger"
            onClick={handleDisconnectDevice}
            disabled={loadingDisconnect || !ObjectConnect.connected}
          >
            {loadingDisconnect ? 'Đang xóa...' : 'Xóa kết nối'}
          </Button>
          <Button variant="primary" onClick={handleConnectObjectWithDevice} disabled={loading}>
            {loading ? 'Đang kết nối...' : 'Kết nối'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Connect;