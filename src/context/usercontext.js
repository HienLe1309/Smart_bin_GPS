import React, { createContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useGeoLocation from '../component/useGeoLocation';

export const UserContext = createContext({ email: '', auth: false });

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ email: '', auth: false });
  const [displayRouteRepair, setdisplayRouteRepair] = useState(false);
  const [displayRouteFull, setdisplayRouteFull] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [UserLogin, setUserLogin] = useState({});
  const [token, setToken] = useState('');
  const [AllBins, setAllBins] = useState([]);
  const [LoginTotal, setLoginTotal] = useState(null);
  const [listAllDevices, setlistAllDevices] = useState([]);
  const [idObjectConnect, setidObjectConnect] = useState(null);
  const [percentBattery, setPercentBattery] = useState(null);
  const [makerOpenPopup, setMakerOpenPopup] = useState({});
  const [listNotifications, setListNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [inforCustomer, setInforCustomer] = useState({});
  const [phoneNumberCustomer, setPhoneNumberCustomer] = useState('');
  const [displayNav, setDisplayNav] = useState(false);
  const [pressPercentBattery, setPressPercentBattery] = useState(false);
  const locationUser = useGeoLocation();
  const [listLoggerBattery, setlistLoggerBattery] = useState([]);
  const [algorithm, setAlgorithm] = useState('NearestNeighbor');
  const [routingControlRepair, setRoutingControlRepair] = useState(null);
  const [showBatteryRoute, setShowBatteryRoute] = useState(false);
  const mapRef = useRef();
  const [triggerBatteryRoute, setTriggerBatteryRoute] = useState(false);

  const loginTotalLogin = (people) => {
    sessionStorage.setItem('totalLogin', people);
    setLoginTotal(people);
  };

  const logoutTotalLogin = () => {
    sessionStorage.removeItem('totalLogin');
    setLoginTotal(null);
  };

  const loginContext = (userName, res) => {
    sessionStorage.setItem('email', userName);
    sessionStorage.setItem('token', res);
    setToken(res);
    setUser({ email: userName, auth: true });
  };

  const logout = () => {
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('token');
    setUser({ email: '', auth: false });
    setToken('');
    navigate('/');
  };

  const handelRepair = () => {
    setdisplayRouteRepair((prev) => !prev);
  };

  const handleFull = () => {
    setdisplayRouteFull((prev) => !prev);
  };

  const toggleShowCollection = () => {
    setShowCollection((prev) => !prev);
  };

  const triggerDisplayBatteryRoute = () => {
    console.log('triggerDisplayBatteryRoute called, current triggerBatteryRoute:', triggerBatteryRoute);
    setTriggerBatteryRoute((prev) => !prev);
    console.log('triggerDisplayBatteryRoute called, current triggerBatteryRoute:', triggerBatteryRoute);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loginContext,
        logout,
        displayRouteFull,
        displayRouteRepair,
        handelRepair,
        handleFull,
        showCollection,
        toggleShowCollection,
        UserLogin,
        setUserLogin,
        token,
        setToken,
        AllBins,
        setAllBins,
        loginTotalLogin,
        logoutTotalLogin,
        LoginTotal,
        setLoginTotal,
        listAllDevices,
        setlistAllDevices,
        idObjectConnect,
        setidObjectConnect,
        percentBattery,
        setPercentBattery,
        makerOpenPopup,
        setMakerOpenPopup,
        listNotifications,
        setListNotifications,
        unreadCount,
        setUnreadCount,
        phoneNumberCustomer,
        setPhoneNumberCustomer,
        inforCustomer,
        setInforCustomer,
        displayNav,
        setDisplayNav,
        pressPercentBattery,
        setPressPercentBattery,
        locationUser,
        listLoggerBattery,
        setlistLoggerBattery,
        algorithm,
        setAlgorithm,
        routingControlRepair,
        setRoutingControlRepair,
        showBatteryRoute,
        setShowBatteryRoute,
        mapRef,
        triggerDisplayBatteryRoute, // Use the function here
        triggerBatteryRoute,
        setTriggerBatteryRoute,
        listNotifications, 
        setListNotifications
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;