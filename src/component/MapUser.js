import './mapUser.scss'

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet'
import axios from 'axios';
import { RiDeleteBin6Fill, RiDeleteBinFill, RiDeleteBin2Fill } from "react-icons/ri";
import { Link } from 'react-router-dom';
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import note from '../asset/images/node_user_2.png'
import useGeoLocation from "./useGeoLocation"
import "leaflet-routing-machine";

import { url } from '../services/UserService'
import { toast } from 'react-toastify';
import * as signalR from '@microsoft/signalr';
import { UserContext } from '../context/usercontext';
import { useContext } from 'react';

function MapUser() {
  const { loginContext, token, setToken } = useContext(UserContext);

  const markerIcon = new L.Icon({
    iconUrl: require("../asset/images/marker.png"),
    iconSize: [23, 30],
    iconAnchor: [10, 38], //[left/right, top/bottom]
    popupAnchor: [4, -40], //[left/right, top/bottom]
  });

  const markerIconUser = new L.Icon({
    iconUrl: require("../asset/images/maker_user.png"),
    iconSize: [40, 40],
    iconAnchor: [17, 45], //[left/right, top/bottom]
    popupAnchor: [0, -46], //[left/right, top/bottom]
  });

  const markerIconRepair = new L.Icon({
    iconUrl: require("../asset/images/marker_repair.png"),
    iconSize: [40, 40],
    iconAnchor: [25, 46], //[left/right, top/bottom]
    popupAnchor: [0, -46], //[left/right, top/bottom]
  });

  const markerIconFull = new L.Icon({
    iconUrl: require("../asset/images/marker_full.png"),
    iconSize: [23, 30],
    iconAnchor: [10, 24], //[left/right, top/bottom]
    popupAnchor: [3, -20], //[left/right, top/bottom]
  });

  const markerIconFullWarning = new L.Icon({
    iconUrl: require("../asset/images/marker_full_warning.png"),
    iconSize: [23, 30],
    iconAnchor: [10, 24], //[left/right, top/bottom]
    popupAnchor: [3, -20], //[left/right, top/bottom]
  });

  const locationUser = useGeoLocation(); // lấy vị trí người dùng
  const ZOOM_LEVEL_USER = 13;
  const [ZOOM_LEVEL, setZOOM_LEVEL] = useState(15);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const mapRef = useRef();
  const [cities, setCities] = useState([]); // danh sách thùng rác
  const [nearestCity, setNearestCity] = useState({}); // thùng rác gần nhất
  const [bufferSignalR, setBufferSignalR] = useState([]); // buffer MQTT
  const [dataFromSignalR, setdataFromSignalR] = useState({ BinUnitId: '' }); // buffer MQTT

  const showMyLocation = () => { // hàm di chuyển đến vị trí người dùng
    if (locationUser.loaded && !locationUser.error) {
      mapRef.current.flyTo(
        [locationUser.coordinates.lat, locationUser.coordinates.lng],
        ZOOM_LEVEL_USER,
        { animate: true }
      );
    } else {
      alert('khong the xac dinh');
    }
  };

  const getcities = async () => {
    let success = false;
    while (!success) {
      try {
        const response = await axios.get(`${url}/Bins/GetAllBins`);
        const citiesData = response.data;
        setCities(citiesData);
        if (response && response.data) {
          success = true;
        } else {
          alert('ReLoad');
        }
      } catch (error) {
        console.error('Get All Logger error, retrying...', error);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };

  useEffect(() => {
    getcities();
  }, []);

  useEffect(() => {
    if (dataFromSignalR.BinUnitId !== '') {
      if (bufferSignalR.length > 0) {
        setBufferSignalR(prevData => {
          const index = prevData.findIndex(obj => obj.BinUnitId === dataFromSignalR.BinUnitId);
          if (index !== -1) {
            return prevData.map((obj, i) => (i === index ? dataFromSignalR : obj));
          } else {
            return [...prevData, dataFromSignalR];
          }
        });
      } else {
        setBufferSignalR([dataFromSignalR]);
      }
    }
  }, [dataFromSignalR]);

  const updateAllFullLevels = (bufferSignalR) => {
    setCities(prevCities => {
      const updatedCities = prevCities.map(city => ({
        ...city,
        binUnits: city.binUnits.map(unit => {
          const fullLevelData = bufferSignalR.find(fl => fl.BinUnitId === unit.binUnitId);
          return fullLevelData
            ? { ...unit, level: fullLevelData.Value }
            : unit;
        })
      }));
      return updatedCities;
    });
  };

  useEffect(() => {
    if (bufferSignalR.length > 0) {
      updateAllFullLevels(bufferSignalR);
    }
  }, [bufferSignalR]);

  const [isSignalRConnected, setIsSignalRConnected] = useState(false);

  useEffect(() => {
    if (cities.length > 0 && !isSignalRConnected) {
      let newConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${url}/NotificationHub`, {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build();

      newConnection.on('ReceiveForUser', (data) => {
        try {
          setdataFromSignalR(JSON.parse(data));
        } catch (error) {
          console.error("Error parsing data:", error);
        }
      });

      newConnection.on('TagForUser', (data) => {
        try {
          setBufferSignalR(JSON.parse(data));
        } catch (error) {
          console.error("Error parsing data:", error);
        }
      });

      newConnection.start()
        .then(() => {
          toast.success("Connected to NotificationHub successfully!");
          newConnection.invoke('GetBufferForUser')
            .then(result => {
              console.log('.invoke GetBufferForUser', result);
            })
            .catch(error => {
              console.error("Error invoking GetBufferForUser:", error);
            });
          setIsSignalRConnected(true);
        })
        .catch(err => {
          console.error("Error while connecting to SignalR:", err);
        });

      newConnection.onreconnected(connectionId => {
        console.log(`Kết nối lại thành công. Connection ID: ${connectionId}`);
      });
      newConnection.onreconnecting(error => {
        console.warn('Kết nối đang được thử lại...', error);
      });
    }
  }, [cities, token]);

  useEffect(() => {
    if (locationUser.loaded && !locationUser.error) {
      showMyLocation();
      setCenter({ lat: locationUser.coordinates.lat, lng: locationUser.coordinates.lng });
      setZOOM_LEVEL(12);
    }
  }, [locationUser]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, ZOOM_LEVEL);
    }
  }, [center, ZOOM_LEVEL]);

  const handleDisplayRouteAvailableNI = () => {
    const newArrayBin = cities.filter((item) => (parseInt(item.binUnits[0].level, 10) < 90 || (parseInt(item.binUnits[0].level, 10) >= 90 && item.binUnits[0].fullCnt == 0)));
    if (newArrayBin.length === 0) {
      toast.error('Tất cả các thùng Thực Phẩm đều đầy');
      RemoveRoute();
      return;
    } else {
      const distances = newArrayBin.map(city => ({
        ...city,
        distance: L.latLng(city.latitude, city.longtitude).distanceTo(L.latLng(center.lat, center.lng))
      }));
      let nearestObject = distances[0];
      for (let i = 1; i < distances.length; i++) {
        if (distances[i].distance < nearestObject.distance) {
          nearestObject = distances[i];
        }
      }
      setNearestCity(nearestObject);
    }
  };

  const handleDisplayRouteAvailableOR = () => {
    const newArrayBin = cities.filter((item) => (parseInt(item.binUnits[1].level, 10) < 90 || (parseInt(item.binUnits[1].level, 10) >= 90 && item.binUnits[1].fullCnt == 0)));
    if (newArrayBin.length === 0) {
      toast.error('Tất cả các thùng OR đều đầy');
      RemoveRoute();
      return;
    } else {
      const distances = newArrayBin.map(city => ({
        ...city,
        distance: L.latLng(city.latitude, city.longtitude).distanceTo(L.latLng(center.lat, center.lng))
      }));
      let nearestObject = distances[0];
      for (let i = 1; i < distances.length; i++) {
        if (distances[i].distance < nearestObject.distance) {
          nearestObject = distances[i];
        }
      }
      setNearestCity(nearestObject);
    }
  };

  const handleDisplayRouteAvailableRI = () => {
    const newArrayBin = cities.filter((item) => (parseInt(item.binUnits[2].level, 10) < 90 || (parseInt(item.binUnits[2].level, 10) >= 90 && item.binUnits[2].fullCnt == 0)));
    if (newArrayBin.length === 0) {
      toast.error('Tất cả các thùng RI đều đầy');
      RemoveRoute();
      return;
    } else {
      const distances = newArrayBin.map(city => ({
        ...city,
        distance: L.latLng(city.latitude, city.longtitude).distanceTo(L.latLng(center.lat, center.lng))
      }));
      let nearestObject = distances[0];
      for (let i = 1; i < distances.length; i++) {
        if (distances[i].distance < nearestObject.distance) {
          nearestObject = distances[i];
        }
      }
      setNearestCity(nearestObject);
    }
  };

  const currentRoutingRef = useRef(null);
  useEffect(() => {
    if (mapRef.current) {
      RemoveRoute();
      const routing = L.Routing.control({
        waypoints: [
          L.latLng(center.lat, center.lng),
          L.latLng(nearestCity.latitude, nearestCity.longtitude)
        ],
        lineOptions: {
          styles: [
            {
              color: "blue",
              opacity: 1,
              weight: 8
            }
          ]
        },
        routeWhileDragging: true,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        createMarker: function () { return null; }
      });
      currentRoutingRef.current = routing;
      routing.addTo(mapRef.current);
    }
  }, [nearestCity]);

  const RemoveRoute = () => {
    if (mapRef.current && currentRoutingRef.current) {
      currentRoutingRef.current.remove();
    }
    currentRoutingRef.current = null;
  };

  const [location, setLocation] = useState({ lat: 10.772434466180004, lng: 106.66772752190417 });

  const handleMapClickGetLocation = (e) => {
    setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    console.log('lat', e.latlng.lat);
    console.log('lng', e.latlng.lng);
  };

  return (
    <>
      <div className="div-map">
        <MapContainer
          center={center}
          zoom={ZOOM_LEVEL}
          ref={mapRef}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MyClickHandlerGetLocation onClick={handleMapClickGetLocation} />
          <Marker
            position={[locationUser.coordinates.lat, locationUser.coordinates.lng]}
            icon={markerIconUser}
          ></Marker>
          {cities.map((bin, idx) => {
            const levelNI = parseInt(bin.binUnits[0].level, 10);
            const levelOR = parseInt(bin.binUnits[1].level, 10);
            const levelRI = parseInt(bin.binUnits[2].level, 10);
            const fullCntOR = bin.binUnits[1].fullCnt;
            const fullCntNI = bin.binUnits[0].fullCnt;
            const fullCntRI = bin.binUnits[2].fullCnt;
            let classNameNI;
            if (!isNaN(levelNI)) {
              classNameNI = levelNI >= 90 ? 'RED' : (levelNI > 70 ? 'YELLOW' : 'GREEN');
            } else {
              classNameNI = 'GREEN';
            }

            let classNameOR;
            if (!isNaN(levelOR)) {
              classNameOR = levelOR >= 90 ? 'RED' : (levelOR > 70 ? 'YELLOW' : 'GREEN');
            } else {
              classNameOR = 'GREEN';
            }

            let classNameRI;
            if (!isNaN(levelRI)) {
              classNameRI = levelRI >= 90 ? 'RED' : (levelRI > 70 ? 'YELLOW' : 'GREEN');
            } else {
              classNameRI = 'GREEN';
            }

            return (
              <Marker
                position={[bin.latitude, bin.longtitude]}
                icon={((levelNI > 90 && bin.binUnits[0].fullCnt == 1) && (levelOR >= 90 && bin.binUnits[1].fullCnt == 1) && (levelRI > 90 && bin.binUnits[2].fullCnt == 1)) ? markerIconFull : markerIcon}
                key={idx}
              >
                <Popup className='popup'>
                  <div className='div-popup'>
                    <div>{bin.id}</div>
                    <div className='popup-text'>
                      <div className='popup-item'>
                        <div className='text'>Không tái chế</div>
                        <div className='icon'>
                        {fullCntNI === 1 ? (
                            <RiDeleteBin2Fill className={classNameNI} />
                          ) : (
                            <RiDeleteBinFill className={classNameNI} />
                          )}
                        </div>
                      </div>
                      <div className='popup-item'>
                        <div className='text'>Hữu cơ</div>
                        <div className='icon'>
                          {fullCntOR === 1 ? (
                            <RiDeleteBin2Fill className={classNameOR} />
                          ) : (
                            <RiDeleteBinFill className={classNameOR} />
                          )}
                        </div>
                      </div>
                      <div className='popup-item'>
                        <div className='text'>Tái chế</div>
                        <div className='icon'>
                        {fullCntRI === 1 ? (
                            <RiDeleteBin2Fill className={classNameRI} />
                          ) : (
                            <RiDeleteBinFill className={classNameRI} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          <div className="custom-div">
            <img src={note} alt="Note" className="custom-image" />
          </div>
          <div className='div-btn'>
            <button onClick={handleDisplayRouteAvailableNI} type="button" className="btn btn-warning">Không tái chế</button>
            <button onClick={handleDisplayRouteAvailableOR} type="button" className="btn btn-warning">Hữu cơ</button>
            <button onClick={handleDisplayRouteAvailableRI} type="button" className="btn btn-warning">Tái chế</button>
          </div>
        </MapContainer>
      </div>
    </>
  );
}

function MyClickHandlerGetLocation({ onClick }) {
  const map = useMapEvent('click', (e) => {
    onClick(e);
  });
  return null;
}

export default MapUser
