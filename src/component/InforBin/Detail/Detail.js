// import React, { useState, useEffect } from 'react';
// import './detail.scss';
// import { useParams, Link } from 'react-router-dom';
// import { IoIosWarning } from 'react-icons/io';
// import axios from 'axios';
// import { Table } from 'react-bootstrap';
// import { FaCircle, FaTimesCircle, FaFire } from 'react-icons/fa';
// import '../Header.scss';
// import { url } from '../../../services/UserService';
// import { UserContext } from '../../../context/usercontext';
// import { useContext } from 'react';
// import { toast } from 'react-toastify';
// import { FaWifi } from 'react-icons/fa';
// import { MdWifiOff } from 'react-icons/md';
// import { initializeSignalR, registerReceiveCallback, registerTagCallback } from './signalRService';

// function Detail() {
//   const { id } = useParams();
//   const { token, setToken } = useContext(UserContext);
//   const [Bin, setBin] = useState([{
//     id: '',
//     longtitude: 0,
//     latitude: 0,
//     address: '',
//     binUnits: [
//       {
//         binUnitId: 'a',
//         collectedHistories: [],
//         compressCnt: 0,
//         fault: 0,
//         flame: 0,
//         fullCnt: 0,
//         level: 0,
//         status: 0,
//         type: 0,
//         vibration: 0,
//       },
//       {
//         binUnitId: 'b',
//         collectedHistories: [],
//         compressCnt: 0,
//         fault: 0,
//         flame: 0,
//         fullCnt: 0,
//         level: 0,
//         status: 0,
//         type: 0,
//         vibration: 0,
//       },
//       {
//         binUnitId: 'c',
//         collectedHistories: [],
//         compressCnt: 0,
//         fault: 0,
//         flame: 0,
//         fullCnt: 0,
//         level: 0,
//         status: 0,
//         type: 0,
//         vibration: 0,
//       },
//     ],
//   }]);
//   const [bufferSignalR, setBufferSignalR] = useState([]);
//   const [IsGetBufferSuccessful, setIsGetBufferSuccessful] = useState(false);
//   const [dataFromSignalR, setdataFromSignalR] = useState([]);
//   const [isSignalRConnected, setIsSignalRConnected] = useState(false);

//   const fetchElement = async () => {
//     let success = false;
//     let retryCount = 0;
//     const maxRetries = 5;
//     while (!success && retryCount < maxRetries) {
//       try {
//         const response = await axios.get(`${url}/Bins/GetBinById?binId=${id}`);
//         if (response && response.data) {
//           setBin([response.data]);
//           success = true;
//         } else {
//           throw new Error('No data received');
//         }
//       } catch (error) {
//         console.error('Get Bin error:', error);
//         retryCount++;
//         await new Promise((resolve) => setTimeout(resolve, 2000));
//       }
//     }
//     if (!success) {
//       toast.error('Failed to fetch bin data after multiple attempts.');
//     }
//   };

//   useEffect(() => {
//     fetchElement();
//   }, [id]);

//   const updateListBinFromBuffer = (bufferSignalR) => {
//     const groupedData = bufferSignalR.reduce((acc, item) => {
//       const { BinId, BinUnitId, Name, Value } = item;
//       const key = BinUnitId || BinId;
//       if (!acc[key]) {
//         acc[key] = {};
//       }
//       acc[key][Name] = Value;
//       return acc;
//     }, {});

//     setBin((prevCities) =>
//       prevCities.map((city) => {
//         const cityData = groupedData[city.id];
//         const updatedCity = cityData
//           ? { ...city, battery: cityData.battery || city.battery, internet: cityData.internet || city.internet }
//           : city;

//         const updatedBinUnits = updatedCity.binUnits.map((unit) => {
//           const unitData = groupedData[unit.binUnitId];
//           if (unitData) {
//             return {
//               ...unit,
//               type: unitData.type || unit.type,
//               compressCnt: unitData.compressCnt || unit.compressCnt,
//               level: unitData.level || unit.level,
//               fault: unitData.fault || unit.fault,
//               flame: unitData.flame || unit.flame,
//               status: unitData.status || unit.status,
//               fullCnt: unitData.fullCnt || unit.fullCnt,
//               vibration: unitData.vibration || unit.vibration,
//               LastCollection: unitData.LastCollection || unit.LastCollection,
//             };
//           }
//           return unit;
//         });

//         return {
//           ...updatedCity,
//           binUnits: updatedBinUnits,
//         };
//       })
//     );
//   };

//   useEffect(() => {
//     if (dataFromSignalR.length > 0) {
//       updateListBinFromBuffer(dataFromSignalR);
//     }
//   }, [dataFromSignalR]);

//   useEffect(() => {
//     if (bufferSignalR.length > 0) {
//       updateListBinFromBuffer(bufferSignalR);
//     }
//   }, [bufferSignalR]);

//   useEffect(() => {
//     if (Bin.length > 0 && !isSignalRConnected) {
//       initializeSignalR(token, url);

//       const receiveCleanup = registerReceiveCallback((data) => {
//         try {
//           const parsedData = JSON.parse(data);
//           if (parsedData.BinId === id && parsedData.Name) {
//             setdataFromSignalR((prev) => {
//               const newData = [...prev, parsedData];
//               if (['status', 'IsConnected'].includes(parsedData.Name)) {
//                 return newData;
//               }
//               return prev;
//             });
//           }
//         } catch (error) {
//           console.error('Error parsing SignalR data:', error);
//         }
//       });

//       const tagCleanup = registerTagCallback((data) => {
//         try {
//           setBufferSignalR(JSON.parse(data));
//         } catch (error) {
//           console.error('Error parsing SignalR data:', error);
//         }
//       });

//       setIsSignalRConnected(true);

//       return () => {
//         receiveCleanup();
//         tagCleanup();
//       };
//     }
//   }, [Bin, token, id, isSignalRConnected]);

//   useEffect(() => {
//     if (Bin[0].battery !== '') {
//       setIsGetBufferSuccessful(true);
//     }
//   }, [Bin]);

//   console.log('BinId', id);

//   return (
//     <div className='fatherInfor'>
//       <div className='header-bin'>
//         <div className='header-bin-item'>
//           <Link className='nav-link' to={`/bin/${id}/detail`}>Chi tiết</Link>
//         </div>
//       </div>

//       {IsGetBufferSuccessful && Bin[0] && (
//         <div className='div-father-detail'>
//           <div className='div-detail'>
//             <Link
//               to="/map"
//               state={{
//                 latBin: Bin[0].latitude,
//                 lngBin: Bin[0].longtitude,
//               }}
//             >
//               <button type="button" className="btn btn-info">Xem vị trí</button>
//             </Link>
//             <h4>Địa chỉ: <span>{Bin[0].address}</span></h4>
//             <h4>Lần cuối thu gom: <span>{Bin[0].binUnits[0].LastCollection}</span></h4>
//             <Link
//               to={`/bin/${id}/detail/update`}
//               state={{ ...Bin[0] }}
//             >
//               <button type="button" className="btn btn-primary">Thay đổi thông tin</button>
//             </Link>
//           </div>

//           <div className='div-father-infoIot'>
//             <div className='inforIot'>
//               <Table striped bordered hover size="sm">
//                 <thead>
//                   <tr>
//                     <th>{Bin[0].id}</th>
//                     <th>Không tái chế</th>
//                     <th>Thực phẩm</th>
//                     <th>Tái chế</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td>Số lần ép</td>
//                     <td>{Bin[0].binUnits[0].compressCnt || 0}</td>
//                     <td>{Bin[0].binUnits[1].compressCnt || 0}</td>
//                     <td>{Bin[0].binUnits[2].compressCnt || 0}</td>
//                   </tr>
//                   <tr>
//                     <td>Lỗi động cơ</td>
//                     <td>{Bin[0].binUnits[0].fault ? <IoIosWarning className='warning' /> : ''}</td>
//                     <td>{Bin[0].binUnits[1].fault ? <IoIosWarning className='warning' /> : ''}</td>
//                     <td>{Bin[0].binUnits[2].fault ? <IoIosWarning className='warning' /> : ''}</td>
//                   </tr>
//                   <tr>
//                     <td>Báo đầy</td>
//                     <td>{Bin[0].binUnits[0].fullCnt ? 'Full' : ''}</td>
//                     <td>{Bin[0].binUnits[1].fullCnt ? 'Full' : ''}</td>
//                     <td>{Bin[0].binUnits[2].fullCnt ? 'Full' : ''}</td>
//                   </tr>
//                   <tr>
//                     <td>Mức độ đầy</td>
//                     <td>{Bin[0].binUnits[0].level || 0}</td>
//                     <td>{Bin[0].binUnits[1].level || 0}</td>
//                     <td>{Bin[0].binUnits[2].level || 0}</td>
//                   </tr>
//                   <tr>
//                     <td>Báo hỏa hoạn</td>
//                     <td>{Bin[0].binUnits[0].flame ? <FaFire className="fire-warning" /> : ''}</td>
//                     <td>{Bin[0].binUnits[1].flame ? <FaFire className="fire-warning" /> : ''}</td>
//                     <td>{Bin[0].binUnits[2].flame ? <FaFire className="fire-warning" /> : ''}</td>
//                   </tr>
//                   <tr>
//                     <td>Báo rung</td>
//                     <td>{Bin[0].binUnits[0].vibration ? <IoIosWarning className='warning' /> : ''}</td>
//                     <td>{Bin[0].binUnits[1].vibration ? <IoIosWarning className='warning' /> : ''}</td>
//                     <td>{Bin[0].binUnits[2].vibration ? <IoIosWarning className='warning' /> : ''}</td>
//                   </tr>
//                   <tr>
//                     <td>Trạng thái kết nối</td>
//                     <td>{!Bin[0].binUnits[0].status ? <FaCircle className='connecting' /> : <FaTimesCircle className='disconnect' />}</td>
//                     <td>{!Bin[0].binUnits[1].status ? <FaCircle className='connecting' /> : <FaTimesCircle className='disconnect' />}</td>
//                     <td>{!Bin[0].binUnits[2].status ? <FaCircle className='connecting' /> : <FaTimesCircle className='disconnect' />}</td>
//                   </tr>
//                   <tr>
//                     <td>Internet</td>
//                     <td colSpan="3">{Bin[0].internet === 0 ? <FaWifi className='connecting' /> : <MdWifiOff className='disconnect' />}</td>
//                   </tr>
//                   <tr>
//                     <td>Pin</td>
//                     <td colSpan="3">{Bin[0].battery || ''}</td>
//                   </tr>
//                 </tbody>
//               </Table>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Detail;
import React, { useState, useEffect } from 'react';
import './detail.scss';
import { useParams, Link } from 'react-router-dom';
import { IoIosWarning } from 'react-icons/io';
import axios from 'axios';
import { Table } from 'react-bootstrap';
import { FaCircle, FaTimesCircle, FaFire } from 'react-icons/fa';
import '../Header.scss';
import { url } from '../../../services/UserService';
import { UserContext } from '../../../context/usercontext';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import { FaWifi } from 'react-icons/fa';
import { MdWifiOff } from 'react-icons/md';
import { initializeSignalR, registerReceiveCallback, registerTagCallback } from './signalRService';

function Detail() {
  const { id } = useParams();
  const { token, setToken } = useContext(UserContext);
  const [Bin, setBin] = useState([{
    id: '',
    longtitude: 0,
    latitude: 0,
    address: '',
    binUnits: [
      {
        binUnitId: 'a',
        collectedHistories: [],
        compressCnt: 0,
        fault: 0,
        flame: 0,
        fullCnt: 0,
        level: 0,
        status: 0,
        type: 0,
        vibration: 0,
      },
      {
        binUnitId: 'b',
        collectedHistories: [],
        compressCnt: 0,
        fault: 0,
        flame: 0,
        fullCnt: 0,
        level: 0,
        status: 0,
        type: 0,
        vibration: 0,
      },
      {
        binUnitId: 'c',
        collectedHistories: [],
        compressCnt: 0,
        fault: 0,
        flame: 0,
        fullCnt: 0,
        level: 0,
        status: 0,
        type: 0,
        vibration: 0,
      },
    ],
  }]);
  const [bufferSignalR, setBufferSignalR] = useState([]);
  const [IsGetBufferSuccessful, setIsGetBufferSuccessful] = useState(false);
  const [dataFromSignalR, setdataFromSignalR] = useState([]);
  const [isSignalRConnected, setIsSignalRConnected] = useState(false);

  const fetchElement = async () => {
    let success = false;
    let retryCount = 0;
    const maxRetries = 5;
    while (!success && retryCount < maxRetries) {
      try {
        const response = await axios.get(`${url}/Bins/GetBinById?binId=${id}`);
        if (response && response.data) {
          setBin([response.data]);
          success = true;
        } else {
          throw new Error('No data received');
        }
      } catch (error) {
        console.error('Get Bin error:', error);
        retryCount++;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
    if (!success) {
      toast.error('Failed to fetch bin data after multiple attempts.');
    }
  };

  useEffect(() => {
    fetchElement();
  }, [id]);

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

    setBin((prevCities) =>
      prevCities.map((city) => {
        const cityData = groupedData[city.id];
        const updatedCity = cityData
          ? { ...city, battery: cityData.battery || city.battery, internet: cityData.internet || city.internet }
          : city;

        const updatedBinUnits = updatedCity.binUnits.map((unit) => {
          const unitData = groupedData[unit.binUnitId];
          if (unitData) {
            return {
              ...unit,
              type: unitData.type || unit.type,
              compressCnt: unitData.compressCnt || unit.compressCnt,
              level: unitData.level || unit.level,
              fault: unitData.fault || unit.fault,
              flame: unitData.flame || unit.flame,
              status: unitData.status || unit.status,
              fullCnt: unitData.fullCnt || unit.fullCnt,
              vibration: unitData.vibration || unit.vibration,
              LastCollection: unitData.LastCollection || unit.LastCollection,
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
    if (Bin.length > 0 && !isSignalRConnected) {
      initializeSignalR(token, url);

      const receiveCleanup = registerReceiveCallback((data) => {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.BinId === id && parsedData.Name) {
            setdataFromSignalR((prev) => {
              const newData = [...prev, parsedData];
              if (['status', 'IsConnected'].includes(parsedData.Name)) {
                return newData;
              }
              return prev;
            });
          }
        } catch (error) {
          console.error('Error parsing SignalR data:', error);
        }
      });

      const tagCleanup = registerTagCallback((data) => {
        try {
          setBufferSignalR(JSON.parse(data));
        } catch (error) {
          console.error('Error parsing SignalR data:', error);
        }
      });

      setIsSignalRConnected(true);

      return () => {
        receiveCleanup();
        tagCleanup();
      };
    }
  }, [Bin, token, id, isSignalRConnected]);

  useEffect(() => {
    if (Bin[0].battery !== '') {
      setIsGetBufferSuccessful(true);
    }
  }, [Bin]);

  console.log('BinId', id);

  return (
    <div className='fatherInfor'>
      <div className='header-bin'>
        <div className='header-bin-item'>
          <Link className='nav-link' to={`/bin/${id}/detail`}>Chi tiết</Link>
        </div>
      </div>

      {IsGetBufferSuccessful && Bin[0] && (
        <div className='div-father-detail'>
          <div className='div-detail'>
            <Link
              to="/map"
              state={{
                latBin: Bin[0].latitude,
                lngBin: Bin[0].longtitude,
              }}
            >
              <button type="button" className="btn btn-info">Xem vị trí</button>
            </Link>
            <h4>Địa chỉ: <span>{Bin[0].address}</span></h4>
            {/* <h4>Lần cuối thu gom: <span>{Bin[0].binUnits[0].collectedHistories[0]?.collectedTime || 'Chưa có dữ liệu'}</span></h4> */}
            <Link
              to={`/bin/${id}/detail/update`}
              state={{ ...Bin[0] }}
            >
              <button type="button" className="btn btn-primary">Thay đổi thông tin</button>
            </Link>
          </div>

          <div className='div-father-infoIot'>
            <div className='inforIot'>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>{Bin[0].id}</th>
                    <th>Không tái chế</th>
                    <th>Thực phẩm</th>
                    <th>Tái chế</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Số lần ép</td>
                    <td>{Bin[0].binUnits[0].compressCnt || 0}</td>
                    <td>{Bin[0].binUnits[1].compressCnt || 0}</td>
                    <td>{Bin[0].binUnits[2].compressCnt || 0}</td>
                  </tr>
                  <tr>
                    <td>Lỗi động cơ</td>
                    <td>{Bin[0].binUnits[0].fault ? <IoIosWarning className='warning' /> : ''}</td>
                    <td>{Bin[0].binUnits[1].fault ? <IoIosWarning className='warning' /> : ''}</td>
                    <td>{Bin[0].binUnits[2].fault ? <IoIosWarning className='warning' /> : ''}</td>
                  </tr>
                  <tr>
                    <td>Báo đầy</td>
                    <td>{Bin[0].binUnits[0].fullCnt ? 'Full' : ''}</td>
                    <td>{Bin[0].binUnits[1].fullCnt ? 'Full' : ''}</td>
                    <td>{Bin[0].binUnits[2].fullCnt ? 'Full' : ''}</td>
                  </tr>
                  <tr>
                    <td>Mức độ đầy</td>
                    <td>{Bin[0].binUnits[0].level || 0}</td>
                    <td>{Bin[0].binUnits[1].level || 0}</td>
                    <td>{Bin[0].binUnits[2].level || 0}</td>
                  </tr>
                  <tr>
                    <td>Báo hỏa hoạn</td>
                    <td>{Bin[0].binUnits[0].flame ? <FaFire className="fire-warning" /> : ''}</td>
                    <td>{Bin[0].binUnits[1].flame ? <FaFire className="fire-warning" /> : ''}</td>
                    <td>{Bin[0].binUnits[2].flame ? <FaFire className="fire-warning" /> : ''}</td>
                  </tr>
                  <tr>
                    <td>Báo rung</td>
                    <td>{Bin[0].binUnits[0].vibration ? <IoIosWarning className='warning' /> : ''}</td>
                    <td>{Bin[0].binUnits[1].vibration ? <IoIosWarning className='warning' /> : ''}</td>
                    <td>{Bin[0].binUnits[2].vibration ? <IoIosWarning className='warning' /> : ''}</td>
                  </tr>
                  <tr>
                    <td>Trạng thái kết nối</td>
                    <td>{!Bin[0].binUnits[0].status ? <FaCircle className='connecting' /> : <FaTimesCircle className='disconnect' />}</td>
                    <td>{!Bin[0].binUnits[1].status ? <FaCircle className='connecting' /> : <FaTimesCircle className='disconnect' />}</td>
                    <td>{!Bin[0].binUnits[2].status ? <FaCircle className='connecting' /> : <FaTimesCircle className='disconnect' />}</td>
                  </tr>
                  <tr>
                    <td>Internet</td>
                    <td colSpan="3">{Bin[0].internet === 0 ? <FaWifi className='connecting' /> : <MdWifiOff className='disconnect' />}</td>
                  </tr>
                  <tr>
                    <td>Pin</td>
                    <td colSpan="3">{Bin[0].battery || ''}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Detail;