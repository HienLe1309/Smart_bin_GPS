// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import './User.scss';
// import { url } from '../services/UserService';

// function User() {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const [user, setUser] = useState({ name: '', point: 0 });
//   const [point, setPoint] = useState(0);

//   // Fetch user data by ID
//   const getUsers = async () => {
//     let success = false;
//     while (!success) {
//       try {
//         const response = await axios.get(`${url}/User/GetUserById?userId=${id}`);
//         const citiesData = response.data;
//         setUser(citiesData);
//         if (response && response.data) {
//           success = true;
//         } else {
//           alert('ReLoad');
//         }
//       } catch (error) {
//         console.error('Get All Logger error, retrying...', error);
//         await new Promise((resolve) => setTimeout(resolve, 2000));
//       }
//     }
//   };

//   // Process bins and update points
//   const processBinsAndUpdatePoints = async () => {
//     try {
//       // Step 1: Fetch all bins
//       const binsResponse = await axios.get(`${url}/Bins/GetAllBins`);
//       const bins = binsResponse.data;

//       // Step 2: Fetch all users
//       const usersResponse = await axios.get(`${url}/User/GetAllUsers`);
//       const users = usersResponse.data;

//       // Step 3: Process each bin with a non-null qr code
//       for (const bin of bins) {
//         if (bin.qr && bin.qr !== '') {
//           // Step 4: Parse qr field to handle stringified array
//           let qrValue = bin.qr;
//           try {
//             // Attempt to parse if qr is a stringified array, e.g., "[\"072203000449\"]"
//             const parsed = JSON.parse(bin.qr);
//             qrValue = Array.isArray(parsed) ? parsed[0] : parsed;
//           } catch (e) {
//             // If parsing fails, use qr as-is
//             console.warn(`Failed to parse QR for bin ${bin.id}: ${bin.qr}`);
//           }

//           // Step 5: Find user with matching identificationNumber
//           const matchedUser = users.find(
//             (user) => user.identificationNumber === qrValue
//           );

//           if (matchedUser) {
//             // Step 6: Update user points
//             const newPoint = matchedUser.point + 1;
//             try {
//               const updateResponse = await axios.patch(
//                 `${url}/PointChange/UpdatePoint?id=${matchedUser.id}`,
//                 { point: newPoint }
//               );

//               if (updateResponse) {
//                 toast.success(`Điểm của ${matchedUser.name} được cập nhật: ${newPoint}`);
                
//                 // Step 7: Clear qr code in the bin using DeleteQRByBinId
//                 try {
//                   await axios.delete(
//                     `https://smartbinapi.azurewebsites.net/Bins/DeleteQRByBinId?binId=${bin.id}`
//                   );
//                   toast.success(`Đã xóa QR cho thùng rác ${bin.id}`);
//                 } catch (error) {
//                   console.error('Error deleting QR code:', error);
//                   toast.error(`Lỗi khi xóa QR cho thùng rác ${bin.id}`);
//                 }
                
//                 // If the current user is the matched user, update local state
//                 if (matchedUser.id === id) {
//                   setUser((prev) => ({ ...prev, point: newPoint }));
//                   setPoint(newPoint);
//                 }
//               } else {
//                 toast.error('Không thể cập nhật điểm');
//               }
//             } catch (error) {
//               console.error('Error updating points:', error);
//               toast.error('Lỗi khi cập nhật điểm');
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Error processing bins:', error);
//       toast.error('Lỗi khi xử lý dữ liệu thùng rác');
//     }
//   };

//   // Fetch user data on mount
//   useEffect(() => {
//     getUsers();
//   }, []);

//   // Update local point state when user data changes
//   useEffect(() => {
//     if (user.name !== '') {
//       setPoint(user.point);
//     }
//   }, [user]);

//   // Run processBinsAndUpdatePoints on mount and periodically
//   useEffect(() => {
//     processBinsAndUpdatePoints();
//     const interval = setInterval(processBinsAndUpdatePoints, 60000); // Run every 60 seconds
//     return () => clearInterval(interval); // Cleanup on unmount
//   }, []);

//   // Handle manual point edit
//   const handleEditPoint = async () => {
//     try {
//       const res = await axios.patch(`${url}/PointChange/UpdatePoint?id=${id}`, {
//         point: parseInt(point),
//       });
//       if (res) {
//         toast.success('Chỉnh sửa điểm thành công');
//         setUser((prev) => ({ ...prev, point: parseInt(point) }));
//       } else {
//         toast.error('Không thể chỉnh sửa điểm');
//       }
//     } catch (error) {
//       console.error('Error editing point:', error);
//       toast.error('Lỗi khi chỉnh sửa điểm');
//     }
//   };

//   return (
//     <div className="father-user">
//       <div className="father-wrapper">
//         <div className="loginInformation">
//           <div className="loginInformation-title">Thông tin người dùng</div>
//           <div className="loginInformation-main">
//             <div className="loginInformation-main-first">
//               <div className="label">Họ và tên</div>
//               <div className="value">{user.name}</div>
//             </div>
//             <div className="loginInformation-main-second">
//               <div className="label">Điểm hiện tại</div>
//               <div className="value">
//                 <input
//                   type="number"
//                   value={point}
//                   onChange={(e) => setPoint(e.target.value)}
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="loginInformation-button">
//             <button className="btn" onClick={handleEditPoint}>
//               Cập nhật
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default User;
// src/component/User.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './User.scss';
import { url } from '../services/UserService';
// import { processBinsAndUpdatePoints } from '../services/BinService';

function User() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState({ name: '', point: 0 });
  const [point, setPoint] = useState(0);

  // Fetch user data by ID
  const getUsers = async () => {
    let success = false;
    while (!success) {
      try {
        const response = await axios.get(`${url}/User/GetUserById?userId=${id}`);
        const citiesData = response.data;
        setUser(citiesData);
        if (response && response.data) {
          success = true;
        } else {
          alert('ReLoad');
        }
      } catch (error) {
        console.error('Get All Logger error, retrying...', error);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };

  // Fetch user data on mount
  useEffect(() => {
    getUsers();
  }, []);

  // Update local point state when user data changes
  useEffect(() => {
    if (user.name !== '') {
      setPoint(user.point);
    }
  }, [user]);

  // // Run processBinsAndUpdatePoints on mount and periodically
  // useEffect(() => {
  //   processBinsAndUpdatePoints(id, setUser);
  //   const interval = setInterval(() => processBinsAndUpdatePoints(id, setUser), 60000);
  //   return () => clearInterval(interval);
  // }, [id]);

  // Handle manual point edit
  const handleEditPoint = async () => {
    try {
      const res = await axios.patch(`${url}/PointChange/UpdatePoint?id=${id}`, {
        point: parseInt(point),
      });
      if (res) {
        toast.success('Chỉnh sửa điểm thành công');
        setUser((prev) => ({ ...prev, point: parseInt(point) }));
      } else {
        toast.error('Không thể chỉnh sửa điểm');
      }
    } catch (error) {
      console.error('Error editing point:', error);
      toast.error('Lỗi khi chỉnh sửa điểm');
    }
  };

  return (
    <div className="father-user">
      <div className="father-wrapper">
        <div className="loginInformation">
          <div className="loginInformation-title">Thông tin người dùng</div>
          <div className="loginInformation-main">
            <div className="loginInformation-main-first">
              <div className="label">Họ và tên</div>
              <div className="value">{user.name}</div>
            </div>
            <div className="loginInformation-main-second">
              <div className="label">Điểm hiện tại</div>
              <div className="value">
                <input
                  type="number"
                  value={point}
                  onChange={(e) => setPoint(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="loginInformation-button">
            <button className="btn" onClick={handleEditPoint}>
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default User;