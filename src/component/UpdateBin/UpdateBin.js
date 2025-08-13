import Form from 'react-bootstrap/Form';
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from "react-leaflet";
import osm from "../osm-providers";
import { useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import axios from 'axios';
import './UpdateBin.scss';
import { listDistrict } from '../../List_Add_District/ListDistrict';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { url } from '../../services/UserService';

function Updatebin() {
    const navigate = useNavigate();
    const location = useLocation();
    const markerIcon = new L.Icon({
        iconUrl: require("../../asset/images/marker.png"),
        iconSize: [25, 30],
        iconAnchor: [15, 30],
        popupAnchor: [-2, -27],
    });
    const [center, setCenter] = useState({ lat: 10.779348472547028, lng: 106.71172379356236 });
    const [ZOOM_LEVEL, setZOOM_LEVEL] = useState(17);
    const mapRef = useRef();
    const [locationNewBin, setLocationNewBin] = useState({ lat: 0, lng: 0 });
    const [street, setStreet] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bin, setBin] = useState({});

    // Fetch bin data when component mounts
    useEffect(() => {
        const fetchBinData = async () => {
            try {
                const response = await axios.get(`${url}/Bins/GetAllBins`);
                const binData = response.data.find(item => item.id === location.state?.id);
                console.log('Check payload:', binData);
                if (binData) {
                    setZOOM_LEVEL(17);
                    setCenter({ lat: binData.latitude, lng: binData.longtitude });
                    setStreet(binData.address || '');
                    setPhoneNumber(binData.userPhoneNumber || '');
                    setLocationNewBin({ lat: binData.latitude, lng: binData.longtitude });
                    setBin({
                        ...binData,
                        latitude: binData.latitude,
                        longitude: binData.longtitude,
                        address: binData.address || '', // Use capitalized Address
                        userPhoneNumber: binData.userPhoneNumber || ''
                    });
                } else {
                    toast.error('Không tìm thấy thùng rác với ID này');
                }
            } catch (error) {
                toast.error('Không thể tải thông tin thùng rác');
                console.error('Fetch bin error:', error);
            }
        };

        if (location.state?.id) {
            fetchBinData();
        }
    }, [location]);

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.setView(center, ZOOM_LEVEL);
        }
    }, [center, ZOOM_LEVEL]);

    const handleMapClickGetLocation = (e) => {
        const latLocation = e.latlng.lat;
        const lngLocation = e.latlng.lng;
        setBin(prevBin => ({
            ...prevBin,
            latitude: latLocation,
            longitude: lngLocation
        }));
        setLocationNewBin({ lat: latLocation, lng: lngLocation });
    };

    const handleChangeStreet = (event) => {
        const selectedStreet = event.target.value;
        setBin(prevBin => ({
            ...prevBin,
            address: selectedStreet // Use capitalized Address
        }));
        setStreet(selectedStreet);
    };

    const handleChangePhoneNumber = (event) => {
        const selectedPhoneNumber = event.target.value;
        setBin(prevBin => ({
            ...prevBin,
            userPhoneNumber: selectedPhoneNumber
        }));
        setPhoneNumber(selectedPhoneNumber);
    };

    const addElement = async () => {
        // Validate required fields
        if (!bin.id) {
            toast.error('Thiếu ID thùng rác');
            return;
        }
        if (!bin.userPhoneNumber || !/^\d{10,}$/.test(bin.userPhoneNumber)) {
            toast.error('Vui lòng nhập số điện thoại hợp lệ (ít nhất 10 chữ số)');
            return;
        }
        if (!bin.address || bin.address.trim() === '') {
            toast.error('Vui lòng nhập địa chỉ hợp lệ');
            return;
        }
        if (!bin.latitude || !bin.longitude) {
            toast.error('Vui lòng chọn vị trí trên bản đồ');
            return;
        }

        try {
            console.log('Check payload2:', bin);
            const updatedBin = {
              userPhoneNumber: bin.userPhoneNumber,
              name: bin.name || "string",
              longitude: bin.longitude,
              latitude: bin.latitude,
              address: bin.address.trim(),
              description: bin.description || "string",
              imagePath: bin.imagePath || "string",
              safeRadius: bin.safeRadius || 0,
              currentTime: bin.currentTime || new Date().toISOString(),
              alarmTime: bin.alarmTime || new Date().toISOString(),
              blueTooth: bin.blueTooth || "string",
              buzzer: bin.buzzer !== undefined ? String(bin.buzzer) : "false",
              sleep: bin.sleep !== undefined ? bin.sleep : false,
              threshold: bin.threshold || 0,
              emergency: bin.emergency !== undefined ? bin.emergency : false
            };
            
            const payload = updatedBin;

            console.log('Bin state before API call:', JSON.stringify(bin, null, 2));
            console.log('Sending payload:', JSON.stringify(payload, null, 2));

            const response = await axios.patch(`${url}/Bins/UpdateBinById?id=${bin.id}`, payload);
            
            if (response && response.data) {
                toast.success('Chỉnh sửa thùng rác thành công');
                navigate(`/bin/${bin.id}/detail`);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.errors 
                ? Object.entries(error.response.data.errors)
                    .map(([key, value]) => `${key}: ${value.join(', ')}`)
                    .join('; ')
                : error.response?.data?.message || error.message;
            toast.error(`Không chỉnh sửa được thông tin: ${errorMessage}`);
            console.error('Update bin error:', JSON.stringify(error.response?.data, null, 2) || error);
        }
    };

    const handleSaveInforBin = () => {
        addElement();
    };

    console.log('update bin', JSON.stringify(bin, null, 2));
    console.log('locationNewBin', locationNewBin);

    return (
        <div>
            <div className='infoBin'>
                <div className="inforBinItem">
                    <label htmlFor="streetInput">Đường</label>
                    <input
                        className="form-control"
                        id="streetInput"
                        aria-describedby="streetHelp"
                        value={street}
                        onChange={handleChangeStreet}
                        placeholder="Nhập địa chỉ"
                    />
                </div>
                <div className="inforBinItem">
                    <label htmlFor="phoneInput">Số điện thoại</label>
                    <input
                        className="form-control"
                        id="phoneInput"
                        aria-describedby="phoneHelp"
                        value={phoneNumber}
                        onChange={handleChangePhoneNumber}
                        placeholder="Nhập số điện thoại"
                    />
                </div>
                <div className='inforBinItem button'>
                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleSaveInforBin}
                    >
                        Lưu
                    </button>
                </div>
            </div>
            <div className="map">
                <MapContainer
                    center={center}
                    zoom={ZOOM_LEVEL}
                    ref={mapRef}
                >
                    <TileLayer
                        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MyClickHandlerGetLocation onClick={handleMapClickGetLocation} />
                    <Marker
                        position={[locationNewBin.lat, locationNewBin.lng]}
                        icon={markerIcon}
                    >
                        <Popup />
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
}

function MyClickHandlerGetLocation({ onClick }) {
    const map = useMapEvent('click', (e) => {
        onClick(e);
    });
    
    return null;
}

export default Updatebin;