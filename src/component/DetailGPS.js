import React,{useState, useEffect, useRef, useContext} from 'react'
import DatePicker from 'react-datepicker';
import './DetailGPS.scss'
import { MdDriveFileRenameOutline } from "react-icons/md";
import { IoIosTime } from "react-icons/io";
import { url } from '../services/UserService';                
import axios from 'axios';
import { FaBluetooth } from "react-icons/fa";
import {useLocation}  from "react-router-dom";
import { LuAlarmClock } from "react-icons/lu";
import { GrConnect } from "react-icons/gr";
import {  toast } from 'react-toastify';
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";  
import "react-clock/dist/Clock.css";
import { AiFillWarning } from "react-icons/ai";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import moment from "moment";
import { SlCheck } from "react-icons/sl";
import { FaBell } from "react-icons/fa";
import * as signalR from "@microsoft/signalr";  
import { MdOutlineDataThresholding } from "react-icons/md";
import { GiNightSleep } from "react-icons/gi";
import { MdCancel } from "react-icons/md";
import { UserContext } from '../context/usercontext'; 

function Detail() {      
    const [image, setImage] = useState(null);
    const [isPressed, setIsPressed] = useState(false);
    const [isPressedBtnThreshold, setisPressedBtnThreshold] = useState(false);
    const [isOn, setIsOn] = useState(false);   
    const [isOnBuzzer, setIsOnBuzzer] = useState(false);   
    const [isOnSleep, setIsOnSleep] = useState(false); 
    const [threshold, setThreshold] = useState(0); 
    const [selectedValue, setSelectedValue] = useState(1); // hoặc giá trị mặc định bạn muốn

    const [isEmergency, setIsEmergency] = useState(false);
    const location = useLocation();     
    const [time, setTime] = useState("00:00:00"); // Giá trị mặc định
    const [timestamp, settimestamp] = useState("00:00:00"); // Giá trị mặc định
    const [ObjectIsConnect, setObjectIsConnect] = useState({id:""}) ;     
    const [devices, setDevices] = useState([]);
    const [isVisible, setIsVisible] = useState(false);

    const [isLoading, setIsLoading] = useState(true); // Thêm state để quản lý trạng thái loading
    const [idDevice, setIdDevice] = useState('');
    const [phone, setPhone] = useState('');
    const [valueFrom, onChangeFrom] = useState(new Date());    
    const [valueTo, onChangeTo] = useState(new Date());
    const [showModalUpdateFirmware, setshowModalUpdateFỉmware] = useState(false);                 
    const [Device, setDevice] = useState({id:'', latitude: 0 , longitude: 0 });   
    const [listHistorBattery, setListHistorBattery] = useState([]);
    const [buffer, setBuffer] = useState([]);
    const {token} =  useContext(UserContext);
    
    
    const getDeviceById = async () => { 
      setIsLoading(true); // Bắt đầu loading
      let success = false;
      while (!success) {   
        try {
          const response = await axios.get(`${url}/GPSDevice/GetGPSDeviceById?Id=${idDevice}`);         
          const DeviceData = response.data;
          // Kiểm tra nếu dữ liệu nhận được hợp lệ
          if (DeviceData) {    
            // const ListStolen = LoggerData.filter((item) => item.stolenLines.length > 0);
            setDevice(DeviceData); 
            // //console.log(DeviceData)       
            success = true; // Dừng vòng lặp khi dữ liệu hợp lệ và được xử lý
          } else {
            alert('ReLoad');
          }
        } catch (error) {
          toast.error("Lỗi khi lấy thông tin thiết bị") 
          await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 2 giây trước khi thử lại
        }
      }
    };

    const getDeviceIdFromURL = () => {
      console.log('Location: ', location);
      const pathSegments = location.pathname.split('/'); 
      return pathSegments[3]; // "G001" ở vị trí thứ 3 trong mảng
    };

    useEffect(() => {  
      if(idDevice !== ''){
        getDeviceById()   
      }
    }, [idDevice]) 

    const scanBluetoothDevices = async () => {
      try {
          const device = await navigator.bluetooth.requestDevice({
              acceptAllDevices: true,
              optionalServices: ['battery_service']
          });
      } catch (error) {
          //toast.error("Lỗi khi quét các thiết bị Bluetooth") 
      }
    };

    useEffect(() => {  

      if(Device.id !== ''){

        setImage(Device.imagePath)

        setTime(extractTime(Device.alarmTime))  

        settimestamp(convertDateTimeBefore(Device.timeStamp))

        if(Device.emergency){
          setIsEmergency(true)
        }
        else{
          setIsEmergency(false)
        }
        setIsLoading(false); // Kết thúc loading sau khi lấy dữ liệu xong
      }
      
    }, [Device]) 

    const getAllObject = async () => {     
      let success = false;
      while (!success) {   
        try {     
          const response = await axios.get(`${url}/Bins/GetBinByPhoneNumber?phoneNumber=${phone}`);          
          const DevicesData = response.data;   
          console.log(DevicesData)      
          // Kiểm tra nếu dữ liệu nhận được hợp lệ
          if (DevicesData && DevicesData.length > 0) {        
            const Devices = DevicesData.find((item) => item.connected === true && item.gpsDeviceId === idDevice);

            if (Devices) {
              ////console.log("Tìm thấy thiết bị:", Devices);
            } else {   
              const ConfirmdeleteDevice = window.confirm("Chú ý, bạn chưa tạo đối tượng kết nối với thiết bị theo dõi!!!");
              console.log("ccccccccccccccccccccccccc");
              if (ConfirmdeleteDevice) {   
               
               
              } else {
                ////console.log("Action canceled.");
              }
            }

            setObjectIsConnect(Devices);         
            success = true; 
          } else {  
              const ConfirmdeleteDevice = window.confirm("Chú ý, bạn chưa tạo đối tượng kết nối với thiết bị theo dõi!!!");
               if (ConfirmdeleteDevice) {      
               
                     
              } else {     
                ////console.log("Action canceled.");
              }  
              success = true; 
          }
        } catch (error) {
          toast.error("Lỗi khi lấy thông tin đối tượng")
          await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 2 giây trước khi thử lại
        }
      }
    };


    useEffect(() => {  
      
      if(phone !== ''){ 
       
          getAllObject()                 
      }  
    }, [phone])              

    useEffect(() => {  
        const deviceId = getDeviceIdFromURL();
        console.log('deviceId', deviceId);              
        setIdDevice(deviceId)   
        const phoneNumer = sessionStorage.getItem('phoneNumber');  
        setPhone(phoneNumer)      
    }, [])   
   
    const handleshowModalUpdateFirmware= ()=> {     
          setshowModalUpdateFỉmware(true)     
    }

    const handleCloseModalUpdateFirmware=()=>{
      setshowModalUpdateFỉmware(false)   
    }  

    function convertDateTimeBefore(inputString) {
      const [date, time] = inputString.split('T');    
      const [year, month, day] = date.split('-');
      return `${day}-${month}-${year} ${time}`;
    }

    const [fileName, setFileName] = useState("");
    const sortByTimestamp = (data) => {
      return data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    };


    const getHistoryBatteryDevice = async (id, startOfDay, endOfDay) => {     
      let success = false;
      while (!success) {   
        try {
          const response = await axios.get(
            `${url}/History/GetBatteryHistory/DeviceId=${id}?startDate=${startOfDay}&endDate=${endOfDay}`  
          );
          const PositionDeviceData = response.data;
    
          if (PositionDeviceData) {


             // Gọi hàm sắp xếp
            const sortedData = sortByTimestamp(PositionDeviceData);

            setListHistorBattery(sortedData); 
            ////console.log('PositionDeviceData', PositionDeviceData);         
            success = true; 
            toast.success("Đã lấy được mức pin")  
          } else {
            alert('ReLoad');
          }
        } catch (error) {
          console.error('getPositionDevice error, retrying...', error);     
          await new Promise(resolve => setTimeout(resolve, 1000)); 
        }
      }
    };

const handleScanAndShow = async () => {
  setIsVisible(true);
  await scanBluetoothDevices();
};

    const callAPIUpdateObjectById = async (bluetoothStatus) => {
      const phoneNumer = sessionStorage.getItem('phoneNumber');
      let success = false;
      while (!success) {   
        try {
          const response = await axios.patch(`${url}/Bins/UpdateBinById?id=${ObjectIsConnect.id}`, 
            {
              "Longitude": ObjectIsConnect.longitude,
              "Latitude": ObjectIsConnect.latitude,
              "SafeRadius": ObjectIsConnect.safeRadius,
              "CurrentTime": "0001-01-01T00:00:00",   
              "AlarmTime": `0001-01-01T${time}`,
              "BlueTooth": bluetoothStatus,  // ✅ Nhận giá trị "ON" hoặc "OFF"
              "Buzzer": isOnBuzzer ? "ON" : "OFF",  // ✅ Nhận giá trị "ON" hoặc "OFF"
              "Sleep": isOnSleep,
              "Threshold": threshold,
              "Emergency": isEmergency,  
              "PhoneNumber": phoneNumer
            }
          );

          const ObjectData = response.data;
          if (ObjectData === 'Update successfully!') { 
            //toast.success(`Đã gửi yêu cầu bật Bluetooth  ${bluetoothStatus === "ON" ? "bật" : "tắt"} thành công`);
            toast.success(`Đã gửi yêu cầu ${bluetoothStatus === "ON" ? "bật" : "tắt"} Bluetooth thành công`);
            success = true;              
          } else {                
            toast.success(`Gửi yêu cầu ${bluetoothStatus === "ON" ? "bật" : "tắt"} Bluetooth không thành công`);
          }
        } catch (error) {
            toast.success(`Gửi yêu cầu ${bluetoothStatus === "ON" ? "bật" : "tắt"} Bluetooth không thành công`);
          await new Promise(resolve => setTimeout(resolve, 1000)); 
        }
      }
    };


    const callAPIUpdateObjectBuzzerById = async (BuzzerStatus) => {
      const phoneNumer = sessionStorage.getItem('phoneNumber');
      let success = false;
      while (!success) {   
        try {
          const response = await axios.patch(`${url}/Bins/UpdateBinById?id=${ObjectIsConnect.id}`, 
            {
              "Longitude": ObjectIsConnect.longitude,
              "Latitude": ObjectIsConnect.latitude,
              "SafeRadius": ObjectIsConnect.safeRadius,
              "CurrentTime": "0001-01-01T00:00:00",   
              "AlarmTime": `0001-01-01T${time}`,  
              "BlueTooth": isOn ? "ON" : "OFF",  // ✅ Nhận giá trị "ON" hoặc "OFF"
              "Buzzer": BuzzerStatus,  // ✅ Nhận giá trị "ON" hoặc "OFF"
              "Sleep": isOnSleep,
              "Threshold": threshold,
              "Emergency": isEmergency,
              "PhoneNumber": phoneNumer
            }
          );

          const ObjectData = response.data;
          if (ObjectData === 'Update successfully!') { 
            toast.success(`Đã gửi yêu cầu ${BuzzerStatus === "ON" ? "bật" : "tắt"} còi thành công`);
            success = true;
          } else {  
            toast.error(`Gửi yêu cầu ${BuzzerStatus === "ON" ? "bật" : "tắt"} còi không thành công`);
          }

        } catch (error) {
          toast.error(`Gửi yêu cầu ${BuzzerStatus === "ON" ? "bật" : "tắt"} còi không thành công`);
          await new Promise(resolve => setTimeout(resolve, 1000)); 
        }
      }
    };


    const callAPIUpdateObjectSleepById = async (SleepStatus) => {
      const phoneNumer = sessionStorage.getItem('phoneNumber');
      let success = false;
      while (!success) {     
        try {
          const response = await axios.patch(`${url}/Bins/UpdateBinById?id=${ObjectIsConnect.id}`, 
            {
              "Longitude": ObjectIsConnect.longitude,
              "Latitude": ObjectIsConnect.latitude,
              "SafeRadius": ObjectIsConnect.safeRadius,
              "CurrentTime": "0001-01-01T00:00:00",   
              "AlarmTime": `0001-01-01T${time}`,  
              "BlueTooth": isOn ? "ON" : "OFF",  // ✅ Nhận giá trị "ON" hoặc "OFF"
              "Buzzer": isOnBuzzer ? "ON" : "OFF",  // ✅ Nhận giá trị "ON" hoặc "OFF"
              "Emergency": isEmergency,
              "Sleep": SleepStatus,
              "Threshold": threshold,
              "PhoneNumber": phoneNumer  
            }
          );

          const ObjectData = response.data;
          if (ObjectData === 'Update successfully!') { 
            toast.success(`${SleepStatus ? "Tắt chức năng chống trộm" : "Bật chức năng chống trộm"}`);
            success = true;
          } else {  
            toast.error(`Gửi yêu cầu ${SleepStatus ? "ngủ" : "thức"} không thành công`);
          }

        } catch (error) {
          toast.error(`Gửi yêu cầu ${SleepStatus === "ON" ? "ngủ" : "thức"} không thành công`);
          await new Promise(resolve => setTimeout(resolve, 1000)); 
        }
      }
    };



    const callAPIUpdateObjecEmergencytById = async (StatusEmergency) => {

      ////console.log('StatusEmergency', StatusEmergency)
      let success = false;
      while (!success) {   
        try {

          const phoneNumer = sessionStorage.getItem('phoneNumber');
          
          
          const response = await axios.patch(`${url}/Bins/UpdateBinById?id=${ObjectIsConnect.id}`, 
            {
              "Longitude": ObjectIsConnect.longitude,
              "Latitude": ObjectIsConnect.latitude,
              "SafeRadius": ObjectIsConnect.safeRadius,
              "CurrentTime": "0001-01-01T00:00:00",     
              "AlarmTime": `0001-01-01T${time}`,
              "BlueTooth": isOn ? "ON" : "OFF",  // ✅ Nhận giá trị "ON" hoặc "OFF"
              "Buzzer": isOnBuzzer ? "ON" : "OFF",  // ✅ Nhận giá trị "ON" hoặc "OFF"
              "Emergency": StatusEmergency,
              "PhoneNumber": phoneNumer,
              "Sleep": isOnSleep,
              "Threshold": threshold,
            }
          );

          const ObjectData = response.data;
          ////console.log(response.data)
          if (ObjectData === 'Update successfully!') { 
            toast.success(`Trạng thái cảnh báo là ${StatusEmergency ? "Khẩn cấp" : "Bình thường"}`);
            success = true;
          } else {  
            toast.error("Xác lập trạng thái cảnh báo không thành công");
          }
        } catch (error) {
            toast.error("Xác lập trạng thái cảnh báo không thành công");
          await new Promise(resolve => setTimeout(resolve, 1000)); 
        }
      }
    };


    const callAPIUpdateObjecAlarmTimetById = async (timeObject) => {
      let success = false;
      while (!success) {   

        const phoneNumer = sessionStorage.getItem('phoneNumber');

        try {
          const response = await axios.patch(`${url}/Bins/UpdateBinById?id=${ObjectIsConnect.id}`, 
            {
              "Longitude": ObjectIsConnect.longitude,
              "Latitude": ObjectIsConnect.latitude,
              "SafeRadius": ObjectIsConnect.safeRadius,
              "CurrentTime": "0001-01-01T00:00:00",      
              "AlarmTime": `0001-01-01T${timeObject}`,  
              "BlueTooth": isOn ? "ON" : "OFF",  // ✅ Nhận giá trị "ON" hoặc "OFF"
              "Buzzer": isOnBuzzer ? "ON" : "OFF",  // ✅ Nhận giá trị "ON" hoặc "OFF"
              "Sleep": isOnSleep,
              "Threshold": threshold,
              "Emergency": isEmergency,     
              "PhoneNumber": phoneNumer  
            }
          );

          const ObjectData = response.data;
          //console.log(response.data)
          if (ObjectData === 'Update successfully!') { 
            toast.success(`Thời gian báo thức là ${timeObject} hàng ngày`);
            success = true;
          } else {  
            toast.error("Xác lập thời gian báo thức không thành công");
          }
        } catch (error) {
            toast.error("Xác lập thời gian báo thức không thành công");
          await new Promise(resolve => setTimeout(resolve, 1000)); 
        }
      }
    };



    const callAPIUpdateObjecThresholdById = async (threshold) => {
      let success = false;
      while (!success) {   

        const phoneNumer = sessionStorage.getItem('phoneNumber');
        try {
          const response = await axios.patch(`${url}/Bins/UpdateBinById?id=${ObjectIsConnect.id}`, 
            {
              "Longitude": ObjectIsConnect.longitude,
              "Latitude": ObjectIsConnect.latitude,
              "SafeRadius": ObjectIsConnect.safeRadius,
              "CurrentTime": "0001-01-01T00:00:00",      
              "AlarmTime": `0001-01-01T${time}`,
              "BlueTooth": isOn ? "ON" : "OFF",  // ✅ Nhận giá trị "ON" hoặc "OFF"
              "Buzzer": isOnBuzzer ? "ON" : "OFF",  // ✅ Nhận giá trị "ON" hoặc "OFF"
              "Sleep": isOnSleep,
              "Threshold": threshold,
              "Emergency": isEmergency,    
              "PhoneNumber": phoneNumer  
            }
          );

          const ObjectData = response.data;
          //console.log(response.data)
          if (ObjectData === 'Update successfully!') { 
            toast.success(`Ngưỡng phát hiện là ${threshold} độ`);
            success = true;
          } else {  
            toast.error("Xác lập không thành công");
          }
        } catch (error) {
            toast.error("Xác lập không thành công");
          await new Promise(resolve => setTimeout(resolve, 1000)); 
        }
      }
    };


    const handleClickAlarmTime = async () => {
      setIsPressed(true);
      await callAPIUpdateObjecAlarmTimetById(time);
      setTimeout(() => setIsPressed(false), 200); // Giữ hiệu ứng 200ms
    };


    const handleClickThreshold = async () => {
      setisPressedBtnThreshold(true);
      await callAPIUpdateObjecThresholdById(threshold);  
      setTimeout(() => setisPressedBtnThreshold(false), 200); // Giữ hiệu ứng 200ms
    };   

    const firstRender = useRef(true); // Biến cờ để kiểm tra lần đầu render
    useEffect(() => {
      if (firstRender.current) {
        firstRender.current = false; // Đánh dấu lần đầu đã render
        return; // Ngăn không chạy lần đầu
      }
      //console.log("Đã chọn xong giờ:", time);
      // Có thể gọi API hoặc xử lý dữ liệu tại đây
    }, [time]); // Chạy khi `time` thay đổi, nhưng bỏ qua lần đầu tiên

    const formatDateTime = (date) => {
      if (!date) return "No date selected";
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

const handleShowRoute = () => { 

            const startOfDay = formatDateTime(valueFrom);
            const endOfDay = formatDateTime(valueTo);
            getHistoryBatteryDevice(idDevice, startOfDay, endOfDay);  
            if(startOfDay < endOfDay){

            }
            else{
              toast.error('Thời gian không hợp lệ')
            }                    
    }

const formattedData = listHistorBattery.map((item) => ({  
  time: moment(item.timestamp).format("HH:mm"), // Hiển thị giờ phút trên trục X
  timestamp: item.timestamp, // Giữ nguyên timestamp để hiển thị tooltip
  value: item.value,
}));

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dateTime = moment(payload[0].payload.timestamp).format("DD/MM/YYYY HH:mm:ss");
    return (
      <div className="bg-white p-2 border border-gray-300 shadow-md rounded">
        <p className="text-xs text-gray-700">{dateTime}</p>
        <p className="text-sm font-semibold">{`Pin: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

    const extractTime = (dateTimeString) => {
      return dateTimeString.split("T")[1]; // Lấy phần sau "T"
    };

    const toggleSwitch = () => {
      
      const newStatus = !isOn;
      setIsOn(newStatus);
      callAPIUpdateObjectById(newStatus ? "ON" : "OFF");  
      
      
      // if(newStatus)  {
      //    scanBluetoothDevices()      
      // }

               
    };

    const toggleSwitchBuzzer = () => {
      const newStatus = !isOnBuzzer;
      setIsOnBuzzer(newStatus);                         
      callAPIUpdateObjectBuzzerById(newStatus ? "ON" : "OFF");
               
    };

    const toggleSwitchSleep = () => {
      const newStatus = !isOnSleep;
      setIsOnSleep(newStatus);                         
      callAPIUpdateObjectSleepById(newStatus);
               
    };

    const toggleSwitchWarning = () => {
      const newStatus = !isEmergency;
      setIsEmergency(newStatus);
      callAPIUpdateObjecEmergencytById(newStatus);
          
    };

    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");

    const handleFileChange = (event) => {
      setFile(event.target.files[0]);
    };


    const handleUpload = async () => {
      if (!file) {
        setMessage("Vui lòng chọn một file .bin");
        return;
      }
  
      const formData = new FormData();
      formData.append("firmware", file);
  
      try {
        const response = await axios.post(
          "https://mygps.runasp.net/Firmware/upload/version=1", // API của bạn
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
  
        if (response.status === 200) {
          setMessage("Tải lên thành công!");
        } else {
          setMessage("Lỗi khi tải lên!");
        }
      } catch (error) {
        setMessage(`Lỗi: ${error.message}`);
      }
    };

    function getBuzzerStatus(dataArray, loggerId) {

      if(loggerId !== ""){
        if(dataArray.length > 0){ 

          
          const buzzerEntry = dataArray.find(
            item => item.LoggerId === loggerId && item.Name === "Buzzer" 
          );
          const bluetoothEntry = dataArray.find(
            item => item.LoggerId === loggerId && item.Name === "Bluetooth" 
          );

          const sleepEntry = dataArray.find(
            item => item.LoggerId === loggerId && item.Name === "Sleep" 
          );

          const thresholdEntry = dataArray.find(
            item => item.LoggerId === loggerId && item.Name === "Threshold" 
          );   
  
          // console.log("id", loggerId )  
          // console.log("dataArray", dataArray )  
          // console.log("buzzerEntry", buzzerEntry ) 
          
          if(buzzerEntry){
            if(buzzerEntry.Value === "ON"){
              setIsOnBuzzer(true)
              toast.success("Còi đang mở")
            }
            if(buzzerEntry.Value === "OFF"){
              setIsOnBuzzer(false)
              toast.success("Còi đang đóng")
            }
          }

          if(bluetoothEntry){
            if(bluetoothEntry.Value === "ON"){
              setIsOn(true)
              toast.success("Bluetooth đang mở")   
            }  
            if(bluetoothEntry.Value === "OFF"){  
              setIsOn(false)
              toast.success("Bluetooth đang đóng")           
            }
          }

          if(sleepEntry){   
            if(sleepEntry.Value){   
              setIsOnSleep(true)  
              toast.success("Thiết bị đang ngủ")   
            }  
            if(!sleepEntry.Value){  
              setIsOnSleep(false)  
              toast.success("Thiết bị đang thức")          
            }
          }

          if(thresholdEntry){
              setThreshold(thresholdEntry.Value)
              toast.success(`Ngưỡng phát hiện là ${thresholdEntry.Value} `)      
          }
        }   
      }
    }

    useEffect(()=>{
      getBuzzerStatus(buffer, idDevice)
    },[buffer, idDevice])

    useEffect(() => {
      console.log("Trước khi khởi tạo SignalR:", {token});
      if (!token) {
        console.log("Chưa có token, bỏ qua khởi tạo SignalR");
        return;
      }
      let connection = new signalR.HubConnectionBuilder()   
        .withUrl(`${url}/NotificationHub`, {
          accessTokenFactory: async () => {
            return token;
          },
          timeout: 10000,
        })   
        .withAutomaticReconnect()    
        .build(); 
    
      // Bắt đầu kết nối   
      connection.start()   
        .then(() => {  
          console.log("✅ Kết nối SignalR Position Device thành công!"); 
    
          // connection.invoke("SendAllAsync")
          //   .catch(err => console.error("Error invoking SendAllAsync:", err));
    
          connection.on(`SendAll`, data => {   
            const obj = JSON.parse(data);
            console.log(`📡 Get buffer:`, obj);
            if(ObjectIsConnect.id !== "") {
              setBuffer(obj);        
            }  
          });
    
          connection.on(`Bluetooth`, data => {
            const obj = JSON.parse(data);
            console.log(`📡 Get Bluetooth:`, obj);
            if(ObjectIsConnect.id !== "") {
              if(obj.Value === "ON") {
                setIsOn(true);
                toast.success("Bluetooth đang mở");
              }
              if(obj.Value === "OFF") {
                setIsOn(false);
                toast.success("Bluetooth đang đóng");
              } 
              settimestamp(convertDateTimeBefore(obj.Timestamp));  
            }                                          
          });
    
          connection.on(`Buzzer`, data => {
            const obj = JSON.parse(data);
            console.log(`📡 Get Buzzer:`, obj);     
            if(ObjectIsConnect.id !== "") {
              if(obj.Value === "ON") {   
                setIsOnBuzzer(true);
                toast.success("Còi đang mở");   
              }
              if(obj.Value === "OFF") {   
                setIsOnBuzzer(false);  
                toast.success("Còi đang đóng");
              }
            }                    
          });
    
          connection.on(`Sleep`, data => {
            const obj = JSON.parse(data);
            console.log(`📡 Get Sleep:`, obj);     
            if(ObjectIsConnect.id !== "") {
              if(obj.Value) {   
                setIsOnSleep(true);
                toast.success("Thiết bị đang ngủ");   
              }
              if(!obj.Value) {   
                setIsOnSleep(false);  
                toast.success("Thiết bị đang thức");
              }
            }                    
          });
    
          connection.on(`Threshold`, data => {
            const obj = JSON.parse(data);
            console.log(`📡 Get Threshold:`, obj);     
            if(ObjectIsConnect.id !== "") {
              setThreshold(obj.Value);
              toast.success(`Ngưỡng phát hiện là ${obj.Value} độ`);
            }                    
          });
        })
        .catch(err => {
          console.error('Kết nối thất bại: ', err);
        });
    
      // Lắng nghe sự kiện kết nối lại
      connection.onreconnected(connectionId => {
        console.log(`Kết nối lại thành công. Connection ID: ${connectionId}`);
      });
    
      // Lắng nghe sự kiện đang kết nối lại
      connection.onreconnecting(error => {
        console.warn('Kết nối đang được thử lại...', error);
      });
    
      // Cleanup khi component unmount hoặc khi Device thay đổi
      return () => {
        console.log("🔴 Ngắt kết nối SignalR...");
        connection.stop();
      };
    }, [Device, idDevice, token]);    



return (  
    <div className='fatherInforDetailDevice'>    
      <div className='wrapperInforDetailDevice'>   

              <div className='InforDetailDeviceTitle'>
                  <div className='InforDetailDeviceTitleItem'>
                      Cấu hình thiết bị
                  </div>  
              </div>     
                
              <div className="Wrapimage">                       
                  <div
                       className="image-containerDevice"                  
                  >
                   {image ? ( 
                              <img src={image} alt="Uploaded" className="uploaded-imageDevice" 
                                 
                              />
                            ) : (
                              <span className="placeholder-text">Chưa chọn ảnh</span>
                            )}
                  </div>
                                  
              </div>

              {isVisible && (
                <div className="absolute left-1/2 transform -translate-x-1/2 w-[400px] max-h-[500px] overflow-auto bg-white border rounded-2xl shadow-xl p-6 z-50">
                    <button 
                        onClick={() => setIsVisible(false)} 
                        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-xl font-bold">×
                    </button>
                    <h2 className="text-xl font-bold text-center text-gray-700 mb-4">🔍 Danh sách thiết bị Bluetooth</h2>
                    <div className="border-t mt-4 pt-3">
                        {devices.length > 0 ? (
                            <ul className="list-none space-y-2">
                                {devices.map((device, index) => (
                                    <li key={index} className="px-4 py-2 bg-gray-100 rounded-lg shadow-sm flex items-center gap-2">
                                        <span className="text-blue-500 text-lg">🔹</span>
                                        <span className="text-gray-800 font-medium">{device}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500">Chưa có thiết bị nào được tìm thấy.</p>
                        )}
                    </div>
                </div>
              )}


          {isLoading ?  (  
                    <div className="loadingContainer">
                      <div className="spinner"></div> {/* Hiển thị hiệu ứng loading */}
                      <p>Đang tải dữ liệu...</p>
                    </div>
                  )     
              
              :

                  (
                  <div
                    className='wrapinformationDevice' 
                  >   
                          
                        <div className='informationDeviceItem'>
                          <div className='informationDeviceItemFirst'>
                              <div className='informationDeviceItemFirstIcon'>
                                  <MdDriveFileRenameOutline className='informationDeviceItemIcon'/>
                              </div>  
                              <div className='informationDeviceItemFirstTitle'>Tên thiết bị:</div>
                          </div>                      
                                                                          
                          <div className='informationDeviceItemSecond'>
                                <div className='informationDeviceItemSecondText'>                                                                          
                                    {Device.name}                                        
                                </div>                                             
                          </div>             
                                     
                        </div>
                      
                        <div className='informationDeviceItem'>
                          <div className='informationDeviceItemFirst'>
                              <div className='informationDeviceItemFirstIcon'>
                                  <IoIosTime className='informationDeviceItemIcon'/>  
                              </div>  
                              <div className='informationDeviceItemFirstTitle'>Cập nhật lần cuối:</div>
                          </div> 
                            
                          <div className='informationDeviceItemSecond'>
                                <div className='informationDeviceItemSecondText'>
                                      {/* {convertDateTimeBefore(Device.timeStamp) !== '01-01-2025 00:00:00' ? `${convertDateTimeBefore(Device.timeStamp)}` : `Chưa được cập nhật`} */}
                                      {timestamp !== '01-01-2025 00:00:00' ? `${timestamp}` : `Chưa được cập nhật`}
                                </div>                                
                          </div>                      
                        </div>


                        <div className='informationDeviceItem'>
                          <div className='informationDeviceItemFirst'>
                            <div className='informationDeviceItemFirstIcon'>
                              <LuAlarmClock className='informationDeviceItemIcon' />  
                            </div>     
                            <div className='informationDeviceItemFirstTitle'>Thời gian báo thức:</div>
                          </div> 

                          <div className='informationDeviceItemSecond'>
                            <div className='informationDeviceItemSecondText'>
                              <TimePicker
                                onChange={setTime}        
                                value={time}  
                                format="HH:mm:ss" // Hiển thị giờ, phút, giây (24h)
                                maxDetail="second" // Cho phép chỉnh cả giây
                                disableClock={false} // Ẩn đồng hồ tròn   
                                className='alarmTimeInput'
                              />
                            </div>  
                            <button className={`btnAlarm transition-all duration-200 active:scale-90 ${isPressed ? "bg-gray-300" : ""}`}  onClick={() => handleClickAlarmTime()}><SlCheck className='iconConfirm'/></button>                           
                          </div>  
                        </div>

                        <div className='informationDeviceItem'>
                          <div className='informationDeviceItemFirst'>
                              <div className='informationDeviceItemFirstIcon'>
                                  <GrConnect className='informationDeviceItemIcon'/>  
                              </div>        
                              <div className='informationDeviceItemFirstTitle'>Đối tượng giám sát:</div>
                          </div> 
                            
                          <div className='informationDeviceItemSecond'>
                                <div className='informationDeviceItemSecondText'>   
                                        {ObjectIsConnect?.id || "Chưa có"}   
                                </div>                                      
                          </div>
                        </div> 




                        <div className='informationDeviceItem'>
                          <div className='informationDeviceItemFirst'>
                              <div className='informationDeviceItemFirstIcon'>
                                  <MdOutlineDataThresholding className='informationDeviceItemIcon'/>  
                              </div>          
                              <div className='informationDeviceItemFirstTitle'>Ngưỡng phát hiện:</div>
                          </div> 
                            
                          <div className='informationDeviceItemSecond'>
                              <div className='informationDeviceItemSecondText'>
                                   <input
                                   type="number"
                                   min="1"
                                   max="180"
                                   style={{
                                            border: '1px solid black',
                                            borderRadius: '4px',
                                            padding: '4px 8px',
                                            width: '80px'
                                          }}
                                   value={threshold}
                                   onChange={(e) => setThreshold(Number(e.target.value))}
                                 />
                              </div>
                              <button className={`btnAlarm transition-all duration-200 active:scale-90 ${isPressedBtnThreshold ? "bg-gray-300" : ""}`}  onClick={() => handleClickThreshold()}><SlCheck className='iconConfirm'/></button>   
                          </div>
                        </div> 

                        <div className='informationDeviceItem'>
                          <div className='informationDeviceItemFirst'>
                            <div className='informationDeviceItemFirstIcon'>
                              <FaBluetooth className='informationDeviceItemIcon'/>  
                            </div>     
                            <div className='informationDeviceItemFirstTitle'>Bluetooth:</div>
                          </div> 

                          <div className="informationDeviceItemSecond">

                          <div className="flex items-center gap-3">
                            <div 
                                className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-all ${isOn ? 'bg-green-500' : 'bg-red-500'}`} 
                                onClick={toggleSwitch}
                            >
                                <div 
                                    className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isOn ? 'translate-x-7' : ''}`}
                                ></div>
                            </div>
                            <span className={`text-sm font-semibold ${isOn ? 'text-green-500' : 'text-red-500'}`}>{isOn ? "ON" : "OFF"}</span>
                          </div>
                          </div>
                        </div>

                        <div className='informationDeviceItem'>
                          <div className='informationDeviceItemFirst'>
                            <div className='informationDeviceItemFirstIcon'>
                              <FaBell className='informationDeviceItemIcon'/>  
                            </div>       
                            <div className='informationDeviceItemFirstTitle'>Còi:</div>
                          </div> 

                          <div className="informationDeviceItemSecond">

                          <div className="flex items-center gap-3">
                            <div                  
                                className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-all ${isOnBuzzer ? 'bg-green-500' : 'bg-red-500'}`} 
                                onClick={toggleSwitchBuzzer}                              
                            >
                                <div 
                                    className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isOnBuzzer ? 'translate-x-7' : ''}`}
                                ></div>
                            </div>
                            <span className={`text-sm font-semibold ${isOnBuzzer ? 'text-green-500' : 'text-red-500'}`}>{isOnBuzzer ? "ON" : "OFF"}</span>
                          </div>
                          </div>
                        </div>

                        <div className='informationDeviceItem'>
                          <div className='informationDeviceItemFirst'>
                            <div className='informationDeviceItemFirstIcon'>
                              <MdCancel className='informationDeviceItemIcon'/>  
                            </div>                     
                            <div className='informationDeviceItemFirstTitle'>Ngắt chống trộm:</div>
                          </div>   

                          <div className="informationDeviceItemSecond">

                          <div className="flex items-center gap-3">
                            <div                  
                                className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-all ${isOnSleep ? 'bg-green-500' : 'bg-red-500'}`} 
                                onClick={toggleSwitchSleep}                              
                            >
                                <div 
                                    className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isOnSleep ? 'translate-x-7' : ''}`}
                                ></div>
                            </div>
                            <span className={`text-sm font-semibold ${isOnSleep ? 'text-green-500' : 'text-red-500'}`}>{isOnSleep ? "ON" : "OFF"}</span>
                          </div>
                          </div>
                        </div>



                        <div className='informationDeviceItem'>
                          <div className='informationDeviceItemFirst'>
                            <div className='informationDeviceItemFirstIcon'>
                              <AiFillWarning className='informationDeviceItemIcon'/>  
                            </div>       
                            <div className='informationDeviceItemFirstTitle'>Mức cảnh báo:</div>
                          </div> 

                          <div className="informationDeviceItemSecond">
                              <div className="flex items-center gap-3">
                                <div 
                                    className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-all ${!isEmergency ? 'bg-green-500' : 'bg-red-500'}`} 
                                    onClick={toggleSwitchWarning}
                                >
                                    <div 
                                        className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isEmergency ? 'translate-x-7' : ''}`}
                                    ></div>
                                </div>
                                <span className={`text-sm font-semibold ${isEmergency ? 'text-red-500' : 'text-green-500'}`}>{isEmergency ? "EMERGENCY" : "NORMAL"}</span>
                              </div>
                                    {/* <button className='btn-off' onClick={() => callAPIUpdateObjectById("ON")}>EMERGENCY</button>
                                    <button className='btn-on' onClick={() => callAPIUpdateObjectById("OFF")}>NORMAL</button> */}
                          </div>

                        </div>          
                </div>)}


                <div className='divBattery'>

                <h2 className="text-xl font-bold mb-4">Biểu đồ mức pin</h2>

                <div className='filterBattery'>   

                            <div className='divTime'>
                            <div className='filterItemBattery filterItemStartBattery'>
                                                   <div>    
                                                        Bắt đầu
                                                   </div>
                                                   <div>
                
                                                     <DatePicker
                                                       selected={valueFrom}
                                                       onChange={onChangeFrom}
                                                       showTimeSelect
                                                       timeIntervals={1}
                                                       timeFormat="HH:mm:ss"
                                                       dateFormat="dd/MM/yyyy - HH:mm:ss"
                                                       popperPlacement="bottom-start"
                                                     />
                                                   </div>
                                     </div> 
                                     <div className='filterItemBattery filterItemEndBattery'>
                                                   <div>
                                                     Kết thúc
                                                   </div>
                                                   <div>  
                                                   
                                                   <DatePicker
                                                         selected={valueTo}
                                                         onChange={onChangeTo}
                                                         showTimeSelect
                                                         timeIntervals={1}
                                                         timeFormat="HH:mm:ss"
                                                         dateFormat="dd/MM/yyyy - HH:mm:ss"
                                                         popperPlacement="bottom-start"
                                                     />
                                                   </div>
                                     </div>
                            </div>                     
                                   

                                     <div className='filterItemButtonBattery'>
                                                   <button 
                                                       type="button" 
                                                       class="btn btn-info"
                                                       onClick={handleShowRoute}
                                                   
                                                   >Xem</button>
                                                   
                                     </div>
                
                </div>    
                
               
    

                <div className="w-full h-[400px]">
                 <ResponsiveContainer width="100%" height="100%" style={{ backgroundColor: "#fff" }}>
                   <LineChart data={formattedData}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="time" />
                     <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                     <Tooltip content={<CustomTooltip />} />
                     <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                   </LineChart>
                 </ResponsiveContainer>
                </div>   
    


                </div>  

                                  
          
          
      </div>
      
    </div>
  )
}

export default Detail
