import './map.scss';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { RiDeleteBin6Fill, RiDeleteBinFill, RiDeleteBin2Fill } from 'react-icons/ri';
import { Link, useLocation } from 'react-router-dom';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import note from '../asset/images/note_admin_3.png';
import { IoIosWarning } from 'react-icons/io';
import { FaSearch } from 'react-icons/fa';
import FilterOptions from './FilterOption';
import useGeoLocation from './useGeoLocation';
import { toast } from 'react-toastify';
import * as signalR from '@microsoft/signalr';
import { UserContext } from '../context/usercontext';
import { useContext } from 'react';
import { url } from '../services/UserService';
import { CSVLink } from 'react-csv';

// Cache để lưu trữ ma trận khoảng cách
let cachedDistanceMatrix = null;

function Map() {
  const { token, setAllBins, setToken, showCollection, listAllDevices, setlistAllDevices, 
    setInforCustomer, inforCustomer, phoneNumberCustomer, setPhoneNumberCustomer,
    percentBattery, pressPercentBattery, zoomLevel, setZoomLevel, triggerBatteryRoute, setTriggerBatteryRoute
  } = useContext(UserContext);
  const locationUser = useGeoLocation();
  const location = useLocation();
  const [BinSelected, setBinSelected] = useState({});
  const [fullBins, setFullBins] = useState([]);
  const [disconnectBins, setDisconnectBins] = useState([]);
  const [warningBins, setWarningBins] = useState([]);
  const [showListBin, setShowListBin] = useState(false);
  const [arrayAllBinsSelected, setArrayAllBinsSelected] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState({
    organic: false,
    recyclable: false,
    nonRecyclable: false,
  });
  const [algorithm, setAlgorithm] = useState('BruteForce'); // New state for algorithm selection
  const ZOOM_LEVEL_USER = 17;
  const [showLocationCollector, setShowLocationCollector] = useState(false);
  const [showLocationCollectorAll, setShowLocationCollectorAll] = useState(false);
  const [LocationUser, setLocationUser] = useState({ latitude: '', longtitude: '' });
  const [LocationUserAll, setLocationUserAll] = useState({ latitude: '', longtitude: '' });
  const [dataFromSignalR, setDataFromSignalR] = useState([]);
  const [bufferSignalR, setBufferSignalR] = useState([]);
  const [isGetBufferSuccessful, setIsGetBufferSuccessful] = useState(false);
  const [ZOOM_LEVEL, setZOOM_LEVEL] = useState(17);
  const [center, setCenter] = useState({ lat: 10.772518784287163, lng: 106.66844844818117 });
  const [cities, setCities] = useState([]);
  const mapRef = useRef();
  const [routingControlRepair, setRoutingControlRepair] = useState(null);
  const [isSignalRConnected, setIsSignalRConnected] = useState(false);
  const [isFromDetail, setIsFromDetail] = useState(false);
  const [csvDistanceData, setCsvDistanceData] = useState([]);
  const [listDevicesStolen,  setlistDevicesStolen] = useState([]);
  const [isLoadingAPIDevices, setLoadingAPIDevices] = useState(false);
  const [deviceAddresses, setDeviceAddresses] = useState({});
  const [isHaveDeviceAddresses, setIsHaveDeviceAddresses] = useState(false);
  const [listLoggerBattery,setlistLoggerBattery] = useState([]) // danh sách thiết bị cần thay pin
  const [dataLoggerClick, setdataLoggerClick] = useState([])
  const [showBatteryRoute, setShowBatteryRoute] = useState(false);

  const markerIcon = new L.Icon({
    iconUrl: require('../asset/images/marker.png'),
    iconSize: [23, 30],
    iconAnchor: [15, 30],
    popupAnchor: [-3, -25],
  });
  const markerIconDisconnect = new L.Icon({
    iconUrl: require('../asset/images/marker_disconnect.png'),
    iconSize: [30, 38],
    iconAnchor: [15, 30],
    popupAnchor: [-3, -25],
  });
  const markerIconWarning = new L.Icon({
    iconUrl: require('../asset/images/marker_warning.png'),
    iconSize: [30, 35],
    iconAnchor: [15, 30],
    popupAnchor: [-3, -25],
  });
  const markerIconUser = new L.Icon({
    iconUrl: require('../asset/images/maker_user.png'),
    iconSize: [40, 40],
    iconAnchor: [15, 30],
    popupAnchor: [0, -46],
  });
  const markerIconDisStmRas = new L.Icon({
    iconUrl: require('../asset/images/disconnectrasstm.png'),
    iconSize: [30, 40],
    iconAnchor: [15, 30],
    popupAnchor: [0, -46],
  });
  const markerIconFull = new L.Icon({
    iconUrl: require('../asset/images/marker_full.png'),
    iconSize: [23, 30],
    iconAnchor: [15, 30],
    popupAnchor: [-3, -26],
  });
  const markerIconFullWarning = new L.Icon({
    iconUrl: require('../asset/images/marker_full_warning.png'),
    iconSize: [30, 38],
    iconAnchor: [15, 30],
    popupAnchor: [-3, -26],
  });
  const battery = new L.Icon({  // vị trí những DataLogger có mức pin cần thay
    iconUrl: require("../asset/images/battery.png" ),
    iconSize: [65,60],
    iconAnchor: [30, 53], // nhỏ thì sang phải, xuống
    popupAnchor: [3, -46], 
  })

  const showMyLocation = useCallback(() => {
    if (locationUser.loaded && !locationUser.error) {
      mapRef.current.flyTo(
        [locationUser.coordinates.lat, locationUser.coordinates.lng],
        ZOOM_LEVEL_USER,
        { animate: true }
      );
    } else {
      alert('Không thể xác định vị trí của bạn');
    }
  }, [locationUser]);

  useEffect(() => {
    if(isLoadingAPIDevices){
      if(listAllDevices.length === 0){
        return;
      }
    }
    if(listAllDevices.length > 0){
        const firstDeviceId = listAllDevices[0].id; // Lấy id của thiết bị đầu tiên
        if (deviceAddresses[firstDeviceId] !== undefined) {      
            setIsHaveDeviceAddresses(true);
        }
    }                
                   
  },[deviceAddresses, isLoadingAPIDevices, listAllDevices]) 

  useEffect(() => {
    if (
      LocationUser.latitude &&
      LocationUser.longtitude &&
      locationUser.loaded &&
      !locationUser.error &&
      !isFromDetail
    ) {
      showMyLocation();
      setCenter({ lat: LocationUser.latitude, lng: LocationUser.longtitude });
      setZOOM_LEVEL(17);
      setShowLocationCollector(true);
    }
  }, [LocationUser, locationUser, showMyLocation, isFromDetail]);

  const getCities = async () => {
    let success = false;
    while (!success) {
      try {
        const response = await axios.get(`${url}/Bins/GetAllBins`);
        const citiesData = response.data.map((bin) => ({
          ...bin,
          internet: bin.internet === 'True' || bin.internet === 'true' || bin.internet === true || bin.internet === 'connected' || bin.internet === '0' || bin.internet === 0 ? 0 : 1,
        }));
        console.log('Raw API data:', citiesData);
        const validCities = citiesData.filter(
          (bin) =>
            bin.latitude != null &&
            bin.longtitude != null &&
            !isNaN(bin.latitude) &&
            !isNaN(bin.longtitude)
        );
        if (validCities.length !== citiesData.length) {
          console.warn(
            `${citiesData.length - validCities.length} bins with invalid coordinates were filtered out`
          );
          const invalidCities = citiesData.filter(
            (bin) =>
              bin.latitude == null ||
              bin.longtitude == null ||
              isNaN(bin.latitude) ||
              isNaN(bin.longtitude)
          );
          console.warn('Invalid bins:', invalidCities);
        }
        setCities(validCities);
        setAllBins(validCities);
        success = true;
      } catch (error) {
        console.error('Get All Logger error, retrying...', error);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };

  const getAllDevices = async () => {   
    let success = false;
    
    while (!success) {
      try {
        const response = await axios.get(`${url}/GPSDevice/GetAllGPSDevices`);  
        const DevicesData = response.data;  
        console.log("Devices: ",DevicesData)  
        // Kiểm tra nếu dữ liệu nhận được hợp lệ   
        if (DevicesData && DevicesData.length > 0) {   
          const phoneNumer = sessionStorage.getItem('phoneNumber');
          const listDevice = DevicesData.filter((item) => item.userPhoneNumber === phoneNumer);
          const listDeviceStolen = listDevice.filter((item) => item.stolen === true);
          console.log('listDevice: ',listDevice)      
          console.log('listDeviceStolen: ',listDeviceStolen) 
          setlistDevicesStolen(listDeviceStolen)  

          setlistAllDevices(listDevice);        
          success = true; 
        } else {   
        }
      } catch (error) {
        toast.error("Lỗi khi lấy thông tin thiết bị") 
        await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 2 giây trước khi thử lại
      }
    }                
                                         
    setLoadingAPIDevices(true)                                                                                      
  };

  const getInforCustomer = async () => {   
    let success = false;
    while (!success) {
      try {
        const response = await axios.get(`${url}/Admin/GetBinAdmin`);  
        const CustomerData = response.data;  
        // Kiểm tra nếu dữ liệu nhận được hợp lệ
        if (CustomerData && CustomerData.length > 0) {
          //console.log(CustomerData)
          const phoneNumer = sessionStorage.getItem('phoneNumber');  
          const Customer = CustomerData.find((item) => item.userPhoneNumber === phoneNumer);
          setInforCustomer(Customer);       
          success = true; 
        } else {
        }
      } catch (error) {
        toast.error("Lỗi khi lấy thông tin người dùng")  
        await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 2 giây trước khi thử lại
      }
    }
  };

  useEffect(() => {
    console.log('[triggerBatteryRoute useEffect] triggerBatteryRoute:', triggerBatteryRoute);
    if (triggerBatteryRoute) {
      console.log('[triggerBatteryRoute useEffect] Calling handleDisplayBatteryRoute');
      handleDisplayBatteryRoute();
      setTriggerBatteryRoute(false);
    }
  }, [triggerBatteryRoute]);

  const handleDisplayBatteryRoute = async () => {
    console.log('[handleDisplayBatteryRoute] Function called');
    console.log('[handleDisplayBatteryRoute] locationUser:', locationUser);
    if (!locationUser.loaded || locationUser.error) {
      console.log('[handleDisplayBatteryRoute] Exiting: Location not loaded or error');
      alert('Không thể xác định vị trí của bạn');
      return;
    }
  
    console.log('[handleDisplayBatteryRoute] percentBattery:', percentBattery);
    if (!percentBattery || percentBattery <= 0) {
      console.log('[handleDisplayBatteryRoute] Exiting: Invalid percentBattery');
      alert('Vui lòng thiết lập mức pin cần thay');
      return;
    }
  
    console.log('[handleDisplayBatteryRoute] listLoggerBattery:', listLoggerBattery);
    if (listLoggerBattery.length === 0) {
      console.log('[handleDisplayBatteryRoute] Exiting: No devices in listLoggerBattery');
      alert('Không có thiết bị nào có mức pin nhỏ hơn hoặc bằng mức đã thiết lập');
      return;
    }
  
    const userLocation = {
      latitude: locationUser.coordinates.lat,
      longtitude: locationUser.coordinates.lng,
    };
    console.log('[handleDisplayBatteryRoute] userLocation:', userLocation);
  
    const devicesToReplace = listLoggerBattery.map((device) => ({
      latitude: device.latitude,
      longtitude: device.longitude,
      id: device.id,
      name: device.name,
    }));
    console.log('[handleDisplayBatteryRoute] devicesToReplace:', devicesToReplace);
  
    const locations = [userLocation, ...devicesToReplace].filter(
      (loc) =>
        loc.latitude != null &&
        loc.longtitude != null &&
        !isNaN(loc.latitude) &&
        !isNaN(loc.longtitude)
    );
    console.log('[handleDisplayBatteryRoute] Filtered locations:', locations);
  
    if (locations.length <= 1) {
      console.log('[handleDisplayBatteryRoute] Exiting: Not enough valid locations');
      alert('Không đủ điểm hợp lệ để tạo tuyến đường thay pin');
      return;
    }
  
    console.log('[handleDisplayBatteryRoute] Calling tsp with locations:', locations);
    try {
      const result = await tsp(locations, 0);
      console.log('[handleDisplayBatteryRoute] tsp result:', result);
      if (!result || !result.path || result.path.length === 0) {
        console.log('[handleDisplayBatteryRoute] Exiting: Invalid tsp result');
        alert('Không thể tính toán tuyến đường thay pin');
        return;
      }
  
      // Detect if path is indices or direct location objects
      let waypoints = [];
      if (typeof result.path[0] === 'number') {
        // Path is indices
        const validPath = result.path.every((index) => Number.isInteger(index) && index >= 0 && index < locations.length);
        if (!validPath) {
          console.log('[handleDisplayBatteryRoute] Exiting: Invalid path indices', result.path);
          alert('Tuyến đường không hợp lệ do lỗi tính toán');
          return;
        }
        waypoints = result.path
          .map((index) => {
            const loc = locations[index];
            if (loc && loc.latitude != null && loc.longtitude != null) {
              return L.latLng(loc.latitude, loc.longtitude);
            }
            console.warn('[handleDisplayBatteryRoute] Skipping invalid location at index:', index);
            return null;
          })
          .filter(waypoint => waypoint !== null); // Filter out invalid waypoints
      } else {
        // Path is direct location objects
        waypoints = result.path
          .map((loc) => {
            if (loc && loc.latitude != null && loc.longtitude != null) {
              return L.latLng(loc.latitude, loc.longtitude);
            }
            console.warn('[handleDisplayBatteryRoute] Skipping invalid location object:', loc);
            return null;
          })
          .filter(waypoint => waypoint !== null); // Filter out invalid waypoints
      }
  
      console.log('[handleDisplayBatteryRoute] Waypoints:', waypoints);
  
      if (waypoints.length < 2) {
        console.log('[handleDisplayBatteryRoute] Exiting: Not enough valid waypoints after filtering');
        alert('Không đủ điểm hợp lệ để vẽ tuyến đường thay pin');
        return;
      }
  
      if (routingControlRepair) {
        console.log('[handleDisplayBatteryRoute] Removing existing routingControlRepair');
        mapRef.current.removeControl(routingControlRepair);
      }
  
      const newRoutingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true,
        show: true,
        addWaypoints: false,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [{ color: 'blue', weight: 4 }],
        },
        createMarker: function () {
          return null;
        },
      }).addTo(mapRef.current);
  
      console.log('[handleDisplayBatteryRoute] New routing control added:', newRoutingControl);
      setRoutingControlRepair(newRoutingControl);
      setShowBatteryRoute(true);
      toast.success('Tuyến đường thay pin đã được vẽ');
    } catch (error) {
      console.error('[handleDisplayBatteryRoute] Error in tsp or routing:', error);
      alert('Lỗi khi vẽ tuyến đường thay pin');
    }
  };


  // useEffect(() => {
  //   if (percentBattery > 0) {
  //     console.log("Percent: ", percentBattery);
  //     console.log("Devices: ", listAllDevices);
  //     const listDataLoggerBattery = listAllDevices.filter(
  //       (item) =>
  //         item.battery <= parseInt(percentBattery) &&
  //         item.latitude != null &&
  //         item.longitude != null &&
  //         !isNaN(item.latitude) &&
  //         !isNaN(item.longitude)
  //     );
  //     console.log("listDataLoggerBattery: ", listDataLoggerBattery);
  //     if (listDataLoggerBattery.length > 0) {
  //       const coordinatesWithId = listDataLoggerBattery.map((device) => ({
  //         id: device.id,
  //         lat: device.latitude,
  //         lng: device.longitude,
  //       }));
  //       setdataLoggerClick(coordinatesWithId);
  //       setlistLoggerBattery(listDataLoggerBattery);
  //       // Đặt center dựa trên thiết bị đầu tiên trong listDataLoggerBattery
  //       const firstDevice = listDataLoggerBattery[0];
  //       if (
  //         firstDevice.latitude != null &&
  //         firstDevice.longitude != null &&
  //         !isNaN(firstDevice.latitude) &&
  //         !isNaN(firstDevice.longitude)
  //       ) {
  //         setCenter({ lat: firstDevice.latitude, lng: firstDevice.longitude });
  //         setZOOM_LEVEL(17); // Tăng mức thu phóng để tập trung vào thiết bị
  //         toast.success(`Hiển thị thiết bị ${firstDevice.name} với mức pin ${firstDevice.battery}%`);
  //       } else {
  //         console.warn('Invalid device coordinates:', firstDevice);
  //       }
  //     } else {
  //       setlistLoggerBattery([]);
  //       toast.error('Không có thiết bị nào có mức pin như yêu cầu');
  //     }
  //   }
  // }, [pressPercentBattery]);
  useEffect(() => {
    if (percentBattery > 0) {
      console.log('[pressPercentBattery useEffect] Starting filter with percentBattery:', percentBattery);
      console.log('[pressPercentBattery useEffect] listAllDevices:', listAllDevices);
      const listDataLoggerBattery = listAllDevices.filter(
        (item) =>
          item.battery <= parseInt(percentBattery) &&
          item.latitude != null &&
          item.longitude != null &&
          !isNaN(item.latitude) &&
          !isNaN(item.longitude)
      );
      console.log('[pressPercentBattery useEffect] Filtered listLoggerBattery:', listDataLoggerBattery);
      if (listDataLoggerBattery.length > 0) {
        const coordinatesWithId = listDataLoggerBattery.map((device) => ({
          id: device.id,
          lat: device.latitude,
          lng: device.longitude,
        }));
        setdataLoggerClick(coordinatesWithId);
        setlistLoggerBattery(listDataLoggerBattery);
        const firstDevice = listDataLoggerBattery[0];
        if (
          firstDevice.latitude != null &&
          firstDevice.longitude != null &&
          !isNaN(firstDevice.latitude) &&
          !isNaN(firstDevice.longitude)
        ) {
          setCenter({ lat: firstDevice.latitude, lng: firstDevice.longitude });
          setZOOM_LEVEL(17);
          toast.success(`Hiển thị thiết bị ${firstDevice.name} với mức pin ${firstDevice.battery}%`);
        }
      } else {
        setlistLoggerBattery([]);
        toast.error('Không có thiết bị nào có mức pin như yêu cầu');
      }
    }
  }, [pressPercentBattery]);

  useEffect(() => {
    getCities();
  }, []);

  useEffect(() => {
    const phoneNumer = sessionStorage.getItem('phoneNumber');  
    setPhoneNumberCustomer(phoneNumer)
    getAllDevices()   
    getInforCustomer();
  }, []); 

  const updateListBinFromBuffer = (bufferSignalR) => {
    const groupedData = bufferSignalR.reduce((acc, item) => {
      const { BinId, BinUnitId, Name, Value } = item;
      const key = BinUnitId || BinId;
      if (!acc[key]) {
        acc[key] = {};
      }
      acc[key][Name] = Value;
      return acc;
    }, {});

    setCities((prevCities) =>
      prevCities.map((city) => {
        const cityData = groupedData[city.id];
        const updatedCity = cityData
          ? {
              ...city,
              battery: cityData.battery || city.battery,
              internet: cityData.internet === 'True' || cityData.internet === 'true' || cityData.internet === true || cityData.internet === 'connected' || cityData.internet === '0' || cityData.internet === 0 ? 0 : 1,
              latitude: city.latitude,
              longtitude: city.longtitude,
            }
          : city;

        const updatedBinUnits = updatedCity.binUnits.map((unit) => {
          const unitData = groupedData[unit.binUnitId];
          if (unitData) {
            return {
              ...unit,
              level: unitData.level || unit.level,
              fault: unitData.fault || unit.fault,
              compressCnt: unitData.compressCnt || unit.compressCnt,
              collectedHistories: unitData.collectedHistories || unit.collectedHistories,
              status: unitData.status || unit.status,
              flame: unitData.flame || unit.flame,
              vibration: unitData.vibration || unit.vibration,
            };
          }
          return unit;
        });

        return {
          ...updatedCity,
          binUnits: updatedBinUnits,
        };
      })
    );
    setIsGetBufferSuccessful(true);
  };

  useEffect(() => {
    if (dataFromSignalR.length > 0) {
      updateListBinFromBuffer(dataFromSignalR);
    }
  }, [dataFromSignalR]);

  useEffect(() => {
    if (bufferSignalR.length > 0) {
      updateListBinFromBuffer(bufferSignalR);
    }
  }, [bufferSignalR]);

  useEffect(() => {
    if (cities.length > 0 && !isSignalRConnected) {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${url}/NotificationHub`, {
          accessTokenFactory: async () => {
            return token;
          },
        })
        .withAutomaticReconnect()
        .build();

      connection.on('ReceiveForAdmin', (data) => {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.Name && parsedData.Value != null) {
            setDataFromSignalR((prev) => [...prev, parsedData]);
          }
        } catch (error) {
          console.error('Error parsing SignalR data:', error);
        }
      });

      connection.on('TagForAdmin', (data) => {
        try {
          setBufferSignalR(JSON.parse(data));
        } catch (error) {
          console.error('Error parsing SignalR data:', error);
        }
      });

      connection.onclose((error) => {
        console.error('Connection closed:', error);
        setIsSignalRConnected(false);
        toast.error('Connection to server lost. Please refresh the page.');
      });

      connection
        .start()
        .then(() => {
          toast.success('Connected to NotificationHub successfully!');
          connection.invoke('GetBufferForAdmin').catch((error) => {
            console.error('Error invoking GetBufferForAdmin:', error.message, error.stack);
          });
          setIsSignalRConnected(true);
        })
        .catch((err) => {
          console.error('Error while connecting to SignalR:', err);
          toast.error('Failed to connect to server. Retrying...');
        });

      return () => {
        // connection.stop().then(() => console.log('SignalR connection stopped'));
      };
    }
  }, [cities, token, isSignalRConnected]);

  useEffect(() => {
    if (isGetBufferSuccessful) {
      const listBinDisconnect = cities.filter((bin) => bin.internet === 1);
      const listBinNeedEmpty = cities.filter(
        (bin) =>
          bin.internet === 0 &&
          ((parseInt(bin.binUnits[0].level, 10) > 90 && bin.binUnits[0].fullCnt == 1) ||
           (parseInt(bin.binUnits[1].level, 10) > 90 && bin.binUnits[1].fullCnt == 1) ||
           (parseInt(bin.binUnits[2].level, 10) > 90 && bin.binUnits[2].fullCnt == 1))
      );
      const listWarningBins = cities.filter(
        (bin) => bin.binUnits[0].fault || bin.binUnits[1].fault || bin.binUnits[2].fault
      );
      setWarningBins(listWarningBins);
      setFullBins(listBinNeedEmpty);
      setDisconnectBins(listBinDisconnect);
    }
  }, [cities, isGetBufferSuccessful]);

  useEffect(() => {
    if (
      mapRef.current &&
      center.lat != null &&
      center.lng != null &&
      !isNaN(center.lat) &&
      !isNaN(center.lng)
    ) {
      mapRef.current.setView(center, ZOOM_LEVEL);
    } else {
      console.warn('Invalid center coordinates:', center);
    }
  }, [center, ZOOM_LEVEL]);

  useEffect(() => {
    if (
      location.state &&
      location.state.latBin != null &&
      location.state.lngBin != null &&
      !isNaN(location.state.latBin) &&
      !isNaN(location.state.lngBin)
    ) {
      setZOOM_LEVEL(17);
      setCenter({ lat: location.state.latBin, lng: location.state.lngBin });
      setIsFromDetail(true);
    } else {
      console.warn('Invalid location.state coordinates:', location.state);
      setIsFromDetail(false);
    }
  }, [location]);

  const handleMapClickGetLocation = (e) => {
    console.log('lat: ' + e.latlng.lat);
    console.log('lng: ' + e.latlng.lng);
  };

  const calculateDistance = async (point1, point2) => {
    if (
      point1.latitude == null ||
      point1.longtitude == null ||
      point2.latitude == null ||
      point2.longtitude == null ||
      isNaN(point1.latitude) ||
      isNaN(point1.longtitude) ||
      isNaN(point2.latitude) ||
      isNaN(point2.longtitude)
    ) {
      console.error('Invalid coordinates:', { point1, point2 });
      return Infinity;
    }

    try {
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${point1.longtitude},${point1.latitude};${point2.longtitude},${point2.latitude}?overview=false`
      );
      const distance = response.data.routes[0].distance;
      return distance;
    } catch (error) {
      console.error('Error calculating route distance:', error);
      return Infinity;
    }
  };

  const getDistanceMatrix = async (locations) => {
    const n = locations.length;
    const locationKey = locations
      .map((loc) => `${loc.latitude},${loc.longtitude}`)
      .sort()
      .join('|');

    if (cachedDistanceMatrix && cachedDistanceMatrix.key === locationKey) {
      return cachedDistanceMatrix.matrix;
    }

    const matrix = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          matrix[i][j] = await calculateDistance(locations[i], locations[j]);
        }
      }
    }

    cachedDistanceMatrix = { key: locationKey, matrix };
    return matrix;
  };

  const getDistanceMatrixForCSV = async (event, done) => {
    if (!locationUser.loaded || locationUser.error) {
      alert('Không thể xác định vị trí của bạn');
      done();
      return;
    }

    let listBinNeedEmpty = cities.filter((bin) => {
      const organic =
        selectedTypes.organic &&
        ((parseInt(bin.binUnits[1].level, 10) >= 90 && bin.binUnits[1].fullCnt == 1) ||
          (arrayAllBinsSelected.includes('MEDIUM') &&
            parseInt(bin.binUnits[1].level, 10) > 70));
      const recyclable =
        selectedTypes.recyclable &&
        ((parseInt(bin.binUnits[2].level, 10) >= 90 && bin.binUnits[2].fullCnt == 1) ||
          (arrayAllBinsSelected.includes('MEDIUM') &&
            parseInt(bin.binUnits[2].level, 10) > 70));
      const nonRecyclable =
        selectedTypes.nonRecyclable &&
        ((parseInt(bin.binUnits[0].level, 10) >= 90 && bin.binUnits[0].fullCnt == 1) ||
          (arrayAllBinsSelected.includes('MEDIUM') &&
            parseInt(bin.binUnits[0].level, 10) > 70));
      return bin.internet === 0 && (organic || recyclable || nonRecyclable);
    });

    if (listBinNeedEmpty.length === 0) {
      alert('Không có thùng rác phù hợp với lựa chọn của bạn');
      done();
      return;
    }

    const userLocation = {
      latitude: locationUser.coordinates.lat,
      longtitude: locationUser.coordinates.lng,
    };

    const locations = [userLocation, ...listBinNeedEmpty].filter(
      (loc) =>
        loc.latitude != null &&
        loc.longtitude != null &&
        !isNaN(loc.latitude) &&
        !isNaN(loc.longtitude)
    );

    if (locations.length <= 1) {
      alert('Không đủ điểm hợp lệ để tạo ma trận khoảng cách');
      done();
      return;
    }

    try {
      const distanceMatrix = await getDistanceMatrix(locations);
      const labels = ['User Location', ...locations.slice(1).map((loc, idx) => `Bin ${loc.address || idx + 1}`)];
      const csvData = [
        ['Distance Matrix (meters)', ...labels],
        ...distanceMatrix.map((row, rowIdx) => [
          labels[rowIdx],
          ...row.map((dist) => (dist === Infinity ? 'N/A' : dist.toFixed(2))),
        ]),
      ];

      setCsvDistanceData(csvData);
      done();
    } catch (error) {
      console.error('Error generating distance matrix for CSV:', error);
      alert('Đã xảy ra lỗi khi tạo ma trận khoảng cách');
      done();
    }
  };

  const getAllPermutations = (array) => {
    const results = [];

    if (array.length === 1) {
      return [array.slice()];
    }

    for (let i = 0; i < array.length; i++) {
      const current = array[i];
      const remaining = array.slice(0, i).concat(array.slice(i + 1));
      const remainingPerms = getAllPermutations(remaining);

      for (let perm of remainingPerms) {
        results.push([current].concat(perm));
      }
    }

    return results;
  };

  const tspBruteForce = async (locations, startIdx) => {
    const startTime = performance.now();

    const n = locations.length;
    try {
      const distanceMatrix = await getDistanceMatrix(locations);
      const indices = Array.from({ length: n - 1 }, (_, i) => i + 1);
      const permutations = getAllPermutations(indices);

      let minDistance = Infinity;
      let bestPath = null;

      for (let perm of permutations) {
        const fullPath = [startIdx, ...perm, startIdx];
        let totalDistance = 0;

        for (let i = 0; i < fullPath.length - 1; i++) {
          const from = fullPath[i];
          const to = fullPath[i + 1];
          const dist = distanceMatrix[from][to];
          if (dist === Infinity) {
            totalDistance = Infinity;
            break;
          }
          totalDistance += dist;
        }

        if (totalDistance < minDistance) {
          minDistance = totalDistance;
          bestPath = fullPath;
        }
      }

      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(2);

      if (!bestPath) {
        return { path: null, executionTime };
      }

      const path = bestPath.map((idx) => locations[idx]);
      return { path, executionTime };
    } catch (error) {
      console.error('Error in tspBruteForce:', error);
      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(2);
      return { path: null, executionTime };
    }
  };

  const tspNearestNeighbor = async (locations, startIdx) => {
    const startTime = performance.now();

    try {
      const distanceMatrix = await getDistanceMatrix(locations);
      const n = locations.length;
      const visited = new Array(n).fill(false);
      const path = [startIdx];
      visited[startIdx] = true;
      let current = startIdx;

      while (path.length < n) {
        let minDistance = Infinity;
        let nextIdx = -1;

        for (let i = 0; i < n; i++) {
          if (!visited[i] && i !== current) {
            const dist = distanceMatrix[current][i];
            if (dist < minDistance) {
              minDistance = dist;
              nextIdx = i;
            }
          }
        }

        if (nextIdx === -1) break;

        path.push(nextIdx);
        visited[nextIdx] = true;
        current = nextIdx;
      }

      path.push(startIdx); // Return to start

      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(2);

      const tspPath = path.map((idx) => locations[idx]);
      return { path: tspPath, executionTime };
    } catch (error) {
      console.error('Error in tspNearestNeighbor:', error);
      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(2);
      return { path: null, executionTime };
    }
  };

  const tsp = async (locations, startIdx) => {
    if (algorithm === 'NearestNeighbor') {
      return await tspNearestNeighbor(locations, startIdx);
    } else {
      return await tspBruteForce(locations, startIdx);
    }
  };

  const handleDisplayRouteAvailableAll = async () => {
    if (!locationUser.loaded || locationUser.error) {
      alert('Không thể xác định vị trí của bạn');
      return;
    }

    let listBinNeedEmpty = cities.filter((bin) => {
      const organic =
        selectedTypes.organic &&
        ((parseInt(bin.binUnits[1].level, 10) >= 90 && bin.binUnits[1].fullCnt == 1) ||
          (arrayAllBinsSelected.includes('MEDIUM') &&
            parseInt(bin.binUnits[1].level, 10) > 70));
      const recyclable =
        selectedTypes.recyclable &&
        ((parseInt(bin.binUnits[2].level, 10) >= 90 && bin.binUnits[2].fullCnt == 1) ||
          (arrayAllBinsSelected.includes('MEDIUM') &&
            parseInt(bin.binUnits[2].level, 10) > 70));
      const nonRecyclable =
        selectedTypes.nonRecyclable &&
        ((parseInt(bin.binUnits[0].level, 10) >= 90 && bin.binUnits[0].fullCnt == 1) ||
          (arrayAllBinsSelected.includes('MEDIUM') &&
            parseInt(bin.binUnits[0].level, 10) > 70));
      return bin.internet === 0 && (organic || recyclable || nonRecyclable);
    });

    if (listBinNeedEmpty.length === 0) {
      alert('Không có thùng rác phù hợp với lựa chọn của bạn');
      return;
    }

    const userLocation = {
      latitude: locationUser.coordinates.lat,
      longtitude: locationUser.coordinates.lng,
    };

    const newArray = [userLocation, ...listBinNeedEmpty].filter(
      (loc) =>
        loc.latitude != null &&
        loc.longtitude != null &&
        !isNaN(loc.latitude) &&
        !isNaN(loc.longtitude)
    );

    if (newArray.length <= 1) {
      alert('Không đủ điểm hợp lệ để tạo tuyến đường');
      return;
    }

    const result = await tsp(newArray, 0);
    const { path: sortedLocations, executionTime } = result;

    if (!sortedLocations) {
      alert(`Không thể tạo tuyến đường do số lượng điểm quá lớn hoặc lỗi dữ liệu. Thời gian thực thi: ${executionTime} ms`);
      return;
    }

    const listLocationFull = sortedLocations.map((bin) =>
      L.latLng(bin.latitude, bin.longtitude)
    );

    const binOrder = sortedLocations.slice(1, -1).map((bin, index) => {
      const binIndex = cities.findIndex(
        (city) => city.latitude === bin.latitude && city.longtitude === bin.longtitude
      );
      return `${index + 1}. Bin ${cities[binIndex]?.address || cities[binIndex]?.id || `ID ${binIndex + 1}`}`;
    });

    if (routingControlRepair) {
      mapRef.current.removeControl(routingControlRepair);
    }

    const routing = L.Routing.control({
      waypoints: [...listLocationFull],
      lineOptions: {
        styles: [{ color: 'blue', opacity: 0.6, weight: 8 }],
      },
      routeWhileDragging: true,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      createMarker: () => null,
    });

    routing.on('routesfound', (e) => {
      const route = e.routes[0];
      const distance = (route.summary.totalDistance / 1000).toFixed(1);
      const time = (route.summary.totalTime / 60).toFixed(1);
      const binOrderText = binOrder.length > 0 ? `Thứ tự thu gom:\n${binOrder.join('\n')}` : 'Không có thùng rác nào được chọn';
      alert(`Tuyến đường: ${distance} km, ${time} phút\nThuật toán: ${algorithm}\nThời gian thực thi thuật toán: ${executionTime} ms\n\n${binOrderText}`);
    });

    routing.addTo(mapRef.current);
    setRoutingControlRepair(routing);
  };

  useEffect(() => {
    if (locationUser.loaded) {
      if (!locationUser.error) {
        setLocationUser({
          latitude: locationUser.coordinates.lat,
          longtitude: locationUser.coordinates.lng,
        });
        console.log('LocationUser set:', {
          latitude: locationUser.coordinates.lat,
          longtitude: locationUser.coordinates.lng,
        });
      } else {
        console.error('Location error:', locationUser.error);
        alert('Không thể lấy vị trí của bạn. Vui lòng kiểm tra quyền truy cập vị trí.');
      }
    }
  }, [locationUser]);

  const handleCollection = () => {
    if (arrayAllBinsSelected.length === 0 || !Object.values(selectedTypes).some((val) => val)) {
      alert('Bạn chưa chọn loại thùng hoặc mức đầy để thu gom');
    } else {
      setShowLocationCollectorAll(true);
    }
  };

  useEffect(() => {
    if (locationUser.loaded && !locationUser.error && showLocationCollectorAll) {
      setLocationUserAll({
        latitude: locationUser.coordinates.lat,
        longtitude: locationUser.coordinates.lng,
      });
    }
  }, [locationUser, showLocationCollectorAll]);

  useEffect(() => {
    if (LocationUserAll.latitude && LocationUserAll.longtitude) {
      handleDisplayRouteAvailableAll();
    }
  }, [LocationUserAll]);

  const handleShowListBin = () => {
    setShowListBin((prev) => !prev);
  };

  const handleBinSelected = (bin) => {
    setBinSelected(bin);
  };

  useEffect(() => {
    if (
      BinSelected.latitude != null &&
      BinSelected.longtitude != null &&
      !isNaN(BinSelected.latitude) &&
      !isNaN(BinSelected.longtitude)
    ) {
      setCenter({ lat: BinSelected.latitude, lng: BinSelected.longtitude });
      setZOOM_LEVEL(17);
    } else {
      console.warn('Invalid BinSelected coordinates:', BinSelected);
    }
  }, [BinSelected]);

  const handleSelectedHighBins = (checked) => {
    if (checked) {
      setArrayAllBinsSelected([...arrayAllBinsSelected, 'HIGH']);
    } else {
      setArrayAllBinsSelected(arrayAllBinsSelected.filter((item) => item !== 'HIGH'));
    }
  };

  const handleSelectedMediumBins = (checked) => {
    if (checked) {
      setArrayAllBinsSelected([...arrayAllBinsSelected, 'MEDIUM']);
    } else {
      setArrayAllBinsSelected(arrayAllBinsSelected.filter((item) => item !== 'MEDIUM'));
    }
  };

  const handleTypeSelected = (type, isChecked) => {
    setSelectedTypes((prev) => ({
      ...prev,
      [type]: isChecked,
    }));
  };

  const getMarkerIcon = useCallback(
    (bin) => {
      if (
        (bin.binUnits[0].fault ||
          bin.binUnits[1].fault ||
          bin.binUnits[2].fault ||
          bin.internet === 1 ||
          bin.binUnits[0].status === 1 ||
          bin.binUnits[1].status === 1 ||
          bin.binUnits[2].status === 1 ||
          bin.binUnits[0].flame ||
          bin.binUnits[1].flame ||
          bin.binUnits[2].flame ||
          bin.binUnits[0].vibration ||
          bin.binUnits[1].vibration ||
          bin.binUnits[2].vibration) &&
        ((parseInt(bin.binUnits[0].level, 10) >= 90 && bin.binUnits[0].fullCnt == 1) &&
         (parseInt(bin.binUnits[1].level, 10) >= 90 && bin.binUnits[1].fullCnt == 1) &&
         (parseInt(bin.binUnits[2].level, 10) >= 90 && bin.binUnits[2].fullCnt == 1))
      )
        return markerIconFullWarning;
      if (
        bin.binUnits[0].fault ||
        bin.binUnits[1].fault ||
        bin.binUnits[2].fault ||
        bin.internet === 1 ||
        bin.binUnits[0].status === 1 ||
        bin.binUnits[1].status === 1 ||
        bin.binUnits[2].status === 1 ||
        bin.binUnits[0].flame ||
        bin.binUnits[1].flame ||
        bin.binUnits[2].flame ||
        bin.binUnits[0].vibration ||
        bin.binUnits[1].vibration ||
        bin.binUnits[2].vibration
      )
        return markerIconWarning;
      if (
        (parseInt(bin.binUnits[0].level, 10) >= 90 && bin.binUnits[0].fullCnt == 1) &&
        (parseInt(bin.binUnits[1].level, 10) >= 90 && bin.binUnits[1].fullCnt == 1) &&
        (parseInt(bin.binUnits[2].level, 10) >= 90 && bin.binUnits[2].fullCnt == 1))
        return markerIconFull;
      return markerIcon;
    },
    [markerIcon, markerIconWarning, markerIconFull, markerIconFullWarning]
  );

  const filteredCities = cities.filter((bin) => {
    if (
      !Object.values(selectedTypes).some((val) => val) ||
      arrayAllBinsSelected.length === 0
    ) {
      return true;
    }

    const organic =
      selectedTypes.organic &&
      ((parseInt(bin.binUnits[1].level, 10) >= 90 && bin.binUnits[1].fullCnt == 1) ||
        (arrayAllBinsSelected.includes('MEDIUM') &&
          parseInt(bin.binUnits[1].level, 10) > 70));
    const recyclable =
      selectedTypes.recyclable &&
      ((parseInt(bin.binUnits[2].level, 10) >= 90 && bin.binUnits[2].fullCnt == 1) ||
        (arrayAllBinsSelected.includes('MEDIUM') &&
          parseInt(bin.binUnits[2].level, 10) > 70));
    const nonRecyclable =
      selectedTypes.nonRecyclable &&
      ((parseInt(bin.binUnits[0].level, 10) >= 90 && bin.binUnits[0].fullCnt == 1) ||
        (arrayAllBinsSelected.includes('MEDIUM') &&
          parseInt(bin.binUnits[0].level, 10) > 70));
    return bin.internet === 0 && (organic || recyclable || nonRecyclable);
  });

  return (
    <div className="father-map">
      {showCollection && 
      <div className="div-button">
        <div className="div-button-item">
          <button className="button" onClick={handleCollection}>
            Thu gom tất cả
          </button>
          <button className="button stop-collection" onClick={handleStopCollection}>
            Tắt thu gom
          </button>
          <CSVLink
            data={csvDistanceData}
            filename={"distance_matrix.csv"}
            className="button export-excel"
            asyncOnClick={true}
            onClick={getDistanceMatrixForCSV}
          >
            Xuất file Excel
          </CSVLink>
          <select
            className="button algorithm-select"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
          >
            <option value="BruteForce">Brute Force</option>
            <option value="NearestNeighbor">Nearest Neighbor</option>
          </select>
        </div>
        <div className="div-button-item">
          <div className="div-button-item-checkbox">
            <input
              type="checkbox"
              id="full"
              checked={arrayAllBinsSelected.includes('HIGH')}
              onChange={(e) => handleSelectedHighBins(e.target.checked)}
            />
            <label htmlFor="full">
              <RiDeleteBinFill style={{ color: 'red' }} />
            </label>
            <input
              type="checkbox"
              id="medium"
              checked={arrayAllBinsSelected.includes('MEDIUM')}
              onChange={(e) => handleSelectedMediumBins(e.target.checked)}
            />
            <label htmlFor="medium">
              <RiDeleteBinFill style={{ color: 'yellow' }} />
            </label>
          </div>
        </div>
      </div>
      }
      <div className="div-map">
        <MapContainer center={center} zoom={ZOOM_LEVEL} ref={mapRef}>
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MyClickHandlerGetLocation onClick={handleMapClickGetLocation} />
          {showLocationCollector && LocationUser.latitude && LocationUser.longtitude && (
            <Marker
              position={[LocationUser.latitude, LocationUser.longtitude]}
              icon={markerIconUser}
            />
          )}
          {showLocationCollectorAll && LocationUserAll.latitude && LocationUserAll.longtitude && (
            <Marker
              position={[LocationUserAll.latitude, LocationUserAll.longtitude]}
              icon={markerIconUser}
            />
          )}
          {filteredCities
            .filter(
              (bin) =>
                bin.latitude != null &&
                bin.longtitude != null &&
                !isNaN(bin.latitude) &&
                !isNaN(bin.longtitude)
            )
            .map((bin) => {
              const levelNI = parseInt(bin.binUnits[0].level, 10);
              const levelOR = parseInt(bin.binUnits[1].level, 10);
              const levelRI = parseInt(bin.binUnits[2].level, 10);
              const fullCntOR = bin.binUnits[1].fullCnt;
              const fullCntNI = bin.binUnits[0].fullCnt;
              const fullCntRI = bin.binUnits[2].fullCnt;

              let classNameNI = 'GREEN';
              if (!isNaN(levelNI)) {
                classNameNI = levelNI >= 90 ? 'RED' : levelNI >= 70 ? 'YELLOW' : 'GREEN';
              }

              let classNameOR = 'GREEN';
              if (!isNaN(levelOR)) {
                classNameOR = levelOR >= 90 ? 'RED' : levelOR >= 70 ? 'YELLOW' : 'GREEN';
              }

              let classNameRI = 'GREEN';
              if (!isNaN(levelRI)) {
                classNameRI = levelRI >= 90 ? 'RED' : levelRI >= 70 ? 'YELLOW' : 'GREEN';
              }

              // Tìm thiết bị dựa trên gpsDeviceId
              // console.log('bin.gpsDeviceId:', bin.gpsDeviceId, 'bin.connected:', bin.connected);
              const device = listAllDevices.find((device) => {
                // console.log('Comparing device.id:', device.id, 'with bin.gpsDeviceId:', bin.gpsDeviceId);
                return String(device.id) === String(bin.gpsDeviceId);
              });
              // console.log('Found device:', device);

              // Xác định batteryLevel dựa trên connected và device
              let batteryLevel;
              if (!bin.gpsDeviceId) {
                batteryLevel = 'Không có GPS Device';
              } else if (!device) {
                batteryLevel = 'Không tìm thấy thiết bị';
              } else if (!bin.connected) {
                batteryLevel = 'Thiết bị không kết nối';
              } else {
                batteryLevel = device.battery;
              }

              return (
                <Marker
                  position={[bin.latitude, bin.longtitude]}
                  icon={getMarkerIcon(bin)}
                  key={bin.id}
                >
                  <Popup className="popup">
                    <div className="div-popup">
                      <div>{bin.id}</div>
                      <div className="popup-text">
                        <div className="popup-item">
                          <div className="text">Không tái chế</div>
                          <div className="icon">
                            {fullCntNI === 1 ? (
                              <RiDeleteBin2Fill className={classNameNI} />
                            ) : (
                              <RiDeleteBinFill className={classNameNI} />
                            )}
                          </div>
                        </div>
                        <div className="popup-item">
                          <div className="text">Thực phẩm</div>
                          <div className="icon">
                            {fullCntOR === 1 ? (
                              <RiDeleteBin2Fill className={classNameOR} />
                            ) : (
                              <RiDeleteBinFill className={classNameOR} />
                            )}
                          </div>
                        </div>
                        <div className="popup-item">
                          <div className="text">Tái chế</div>
                          <div className="icon">
                            {fullCntRI === 1 ? (
                              <RiDeleteBin2Fill className={classNameRI} />
                            ) : (
                              <RiDeleteBinFill className={classNameRI} />
                            )}
                          </div>
                        </div>
                        <div className="popup-item">
                          <div className="text">Mức pin thiết bị:</div>
                          <div className="value">
                            <div className="value">{batteryLevel} {batteryLevel !== 'Không có GPS Device' && batteryLevel !== 'Không tìm thấy thiết bị' && batteryLevel !== 'Thiết bị không kết nối' ? '%' : ''}</div>
                          </div>
                        </div>
                      </div>
                      <div className="popup-button">
                        <Link to={`/bin/${bin.id}/detail`}>
                          <button type="button" className="btn btn-primary" data-mdb-ripple-init>
                            Chi tiết
                          </button>
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            {showBatteryRoute && listLoggerBattery.map((device) => (
              <Marker
                key={device.id}
                position={[device.latitude, device.longitude]}
                icon={battery}
              >
                <Popup className="popup">
                  <div className="div-popup">
                    <div>Thiết bị: {device.name || device.id}</div>
                    <div className="popup-text">
                      <div className="popup-item">
                        <div className="text">Mức pin:</div>
                        <div className="value">{device.battery}%</div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
          ))}
          <div className="custom-div">
            <img src={note} alt="Note" className="custom-image" />
          </div>
          <div className={showListBin ? 'move' : 'div-icon-search'} onClick={handleShowListBin}>
            <FaSearch className="icon-search" />
          </div>
        </MapContainer>
      </div>
      {showListBin && (
        <FilterOptions show={showListBin} handleTypeSelected={handleTypeSelected} />
      )}
      {isGetBufferSuccessful && (
        <div className="map-footer">
          <div className="map-footer-item">
            <div className="map-footer-item-title">Tổng số điểm</div>
            <div className="map-footer-item-data total">{cities.length}</div>
          </div>
          <div className="map-footer-item">
            <div className="map-footer-item-title">Số điểm cảnh báo</div>
            <div className="map-footer-item-data warning">{warningBins.length}</div>
          </div>
          <div className="map-footer-item">
            <div className="map-footer-item-title">Số điểm đầy</div>
            <div className="map-footer-item-data full">{fullBins.length}</div>
          </div>
          <div className="map-footer-item">
            <div className="map-footer-item-title">Số điểm mất Internet</div>
            <div className="map-footer-item-data disconnect">{disconnectBins.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function MyClickHandlerGetLocation({ onClick }) {
  useMapEvent('click', (e) => {
    onClick(e);
  });
  return null;
}

export default Map;
