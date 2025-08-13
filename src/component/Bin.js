import React, { useEffect, useState } from 'react';
import { GiAutoRepair } from "react-icons/gi";
import './bin.scss';
import { Link } from 'react-router-dom';
import { FaCircle } from "react-icons/fa6";
import { FaTimesCircle } from "react-icons/fa";
import { IoInformationCircle } from "react-icons/io5";
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { MdDelete } from "react-icons/md";
import { BiSolidError } from "react-icons/bi";
import axios from 'axios';
import _ from 'lodash';
import { FaFilter } from "react-icons/fa";
import { CSVLink, CSVDownload } from "react-csv";
import Button from 'react-bootstrap/Button';
import { url } from '../services/UserService';
import { toast } from 'react-toastify';
import { UserContext } from '../context/usercontext';
import { useContext } from 'react';
import * as signalR from '@microsoft/signalr';

function Bin() {
  const { loginContext, token, setToken, AllBins, setAllBins } = useContext(UserContext);
  const [filterConnection, setFilterConnection] = useState('Kết nối');
  const [filterWarning, setfilterWarning] = useState('Cảnh báo');
  const [filterOrganic, setfilterOrganic] = useState('filter');
  const [dataExport, setDataExport] = useState([]);
  const [filterStreet, setfilterStreet] = useState('');
  const [Bins, setBins] = useState([]); // Lưu dữ liệu gốc
  const [filteredBins, setFilteredBins] = useState([]); // Lưu dữ liệu đã lọc
  const [BinsInitial, setBinsInitial] = useState([]);
  const [dataFromSignalR, setdataFromSignalR] = useState([]);
  const [bufferSignalR, setBufferSignalR] = useState([]);
  const [IsGetBufferSuccessful, setIsGetBufferSuccessful] = useState(false);

  const getcities = async () => {
    let success = false;
    while (!success) {
      try {
        const response = await axios.get(`${url}/Bins/GetAllBins`);
        const citiesData = response.data.map(bin => ({
          ...bin,
          internet: bin.internet === 'True' || bin.internet === 'true' || bin.internet === true || bin.internet === 'connected' || bin.internet === '0' || bin.internet === 0 ? 0 : 1
        }));
        console.log('Raw data from API:', response.data);
        console.log('Normalized data:', citiesData);
        setBins(citiesData);
        setFilteredBins(citiesData); // Khởi tạo filteredBins với dữ liệu gốc

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

    setBins(prevCities => {
      const updatedCities = prevCities.map(city => {
        const cityData = groupedData[city.id];
        const updatedCity = cityData
          ? {
              ...city,
              battery: cityData.battery || city.battery,
              internet: cityData.internet === 'True' || cityData.internet === 'true' || cityData.internet === true || cityData.internet === 'connected' || cityData.internet === '0' || cityData.internet === 0 ? 0 : 1
            }
          : city;

        const updatedBinUnits = updatedCity.binUnits.map(unit => {
          const unitData = groupedData[unit.binUnitId];
          if (unitData) {
            return {
              ...unit,
              compressCnt: unitData.compressCnt || unit.compressCnt,
              level: unitData.level || unit.level,
              fault: unitData.fault || unit.fault,
              collectedHistories: unitData.collectedHistories || unit.collectedHistories,
              status: unitData.status || unit.status,
            };
          }
          return unit;
        });

        return {
          ...updatedCity,
          binUnits: updatedBinUnits
        };
      });
      console.log('Updated cities from SignalR:', updatedCities);
      setFilteredBins(updatedCities); // Cập nhật filteredBins khi SignalR cập nhật dữ liệu
      return updatedCities;
    });
  };

  useEffect(() => {
    if (bufferSignalR.length > 0) {
      updateListBinFromBuffer(bufferSignalR);
    }
  }, [bufferSignalR]);

  useEffect(() => {
    if (dataFromSignalR.length > 0) {
      updateListBinFromBuffer(dataFromSignalR);
    }
  }, [dataFromSignalR]);

  // const [isSignalRConnected, setIsSignalRConnected] = useState(false);
  // useEffect(() => {
  //   if (Bins.length > 0 && !isSignalRConnected) {
  //     let newConnection = new signalR.HubConnectionBuilder()
  //       .withUrl(`${url}/NotificationHub`, {
  //         accessTokenFactory: () => token
  //       })
  //       .withAutomaticReconnect()
  //       .build();
  //     let ArrayDataRealTime = [];
  //     newConnection.on('ReceiveForAdmin', (data) => {
  //       try {
  //         if (JSON.parse(data).Name === 'battery') {
  //           ArrayDataRealTime.push(JSON.parse(data));
  //         }
  //         if (JSON.parse(data).Name === 'internet') {
  //           ArrayDataRealTime.push(JSON.parse(data));
  //           setdataFromSignalR(ArrayDataRealTime);
  //           ArrayDataRealTime = [];
  //         }
  //         if (JSON.parse(data).Name === 'compressCnt') {
  //           ArrayDataRealTime.push(JSON.parse(data));
  //         }
  //         if (JSON.parse(data).Name === 'fault') {
  //           ArrayDataRealTime.push(JSON.parse(data));
  //         }
  //         if (JSON.parse(data).Name === 'collectedHistories') {
  //           ArrayDataRealTime.push(JSON.parse(data));
  //         }
  //         if (JSON.parse(data).Name === 'status') {
  //           ArrayDataRealTime.push(JSON.parse(data));
  //           setdataFromSignalR(ArrayDataRealTime);
  //           ArrayDataRealTime = [];
  //         }
  //       } catch (error) {
  //         console.error("Error parsing data:", error);
  //       }
  //     });

  //     newConnection.on('TagForAdmin', (data) => {
  //       try {
  //         setBufferSignalR(JSON.parse(data));
  //         setIsGetBufferSuccessful(true);
  //       } catch (error) {
  //         console.error("Error parsing data:", error);
  //       }
  //     });

  //     newConnection.start()
  //       .then(() => {
  //         toast.success("Connected to NotificationHub successfully!");
  //         newConnection.invoke('GetBufferForAdmin')
  //           .then(result => {})
  //           .catch(error => {
  //             console.error("Error invoking GetBufferForAdmin:", error);
  //           });

  //         setIsSignalRConnected(true);
  //       })
  //       .catch(err => {
  //         console.error("Error while connecting to SignalR:", err);
  //       });

  //     newConnection.onreconnected(connectionId => {
  //       console.log(`Kết nối lại thành công. Connection ID: ${connectionId}`);
  //     });
  //     newConnection.onreconnecting(error => {
  //       console.warn('Kết nối đang được thử lại...', error);
  //     });
  //   }
  // }, [Bins]);
  const refreshToken = async () => {
    try {
      const response = await axios.post(`${url}/auth/refresh`, {
        refreshToken: localStorage.getItem('refreshToken'), // Adjust based on your auth setup
      });
      const newToken = response.data.accessToken;
      setToken(newToken); // Update token in context
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  };
  
  const [isSignalRConnected, setIsSignalRConnected] = useState(false);
  useEffect(() => {
    if (Bins.length > 0 && !isSignalRConnected) {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${url}/NotificationHub`, {
          accessTokenFactory: async () => {
            try {
              const decodedToken = JSON.parse(atob(token.split('.')[1]));
              if (Date.now() >= decodedToken.exp * 1000) {
                return await refreshToken();
              }
              return token;
            } catch (error) {
              console.error('Error in accessTokenFactory:', error);
              throw error;
            }
          },
          logger: signalR.LogLevel.Information,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount < 5) {
              return 2000 * (retryContext.previousRetryCount + 1); // Exponential backoff
            }
            toast.error('Failed to reconnect to server after multiple attempts.');
            return null;
          },
        })
        .build();
  
      let ArrayDataRealTime = [];
      connection.on('ReceiveForAdmin', (data) => {
        try {
          const parsedData = JSON.parse(data);
          if (['battery', 'internet', 'compressCnt', 'fault', 'collectedHistories', 'status'].includes(parsedData.Name)) {
            ArrayDataRealTime.push(parsedData);
            if (['internet', 'status'].includes(parsedData.Name)) {
              setdataFromSignalR(ArrayDataRealTime);
              ArrayDataRealTime = [];
            }
          }
        } catch (error) {
          console.error('Error parsing ReceiveForAdmin data:', error);
        }
      });
  
      connection.on('TagForAdmin', (data) => {
        try {
          setBufferSignalR(JSON.parse(data));
          setIsGetBufferSuccessful(true);
        } catch (error) {
          console.error('Error parsing TagForAdmin data:', error);
        }
      });
  
      connection.onclose((error) => {
        console.error('SignalR connection closed:', error);
        setIsSignalRConnected(false);
        toast.error('Lost connection to server. Retrying...');
      });
  
      connection
        .start()
        .then(() => {
          toast.success('Connected to NotificationHub successfully!');
          connection.invoke('GetBufferForAdmin').catch((error) => {
            console.error('Error invoking GetBufferForAdmin:', error);
          });
          setIsSignalRConnected(true);
        })
        .catch((err) => {
          console.error('Error while connecting to SignalR:', err);
          toast.error('Failed to connect to server. Retrying...');
        });
  
      return () => {
        // Optional: Cleanup connection on unmount
        // connection.stop().catch((err) => console.error('Error stopping SignalR:', err));
      };
    }
  }, [Bins, token, isSignalRConnected, setToken]);

  useEffect(() => {
    let cloneBins = _.cloneDeep(Bins); // Luôn bắt đầu từ dữ liệu gốc

    console.log('Bins before filtering:', cloneBins.map(bin => ({ id: bin.id, internet: bin.internet, internetType: typeof bin.internet, faults: bin.binUnits.map(unit => unit.fault), levels: bin.binUnits.map(unit => unit.level) })));

    if (filterStreet === '') {
      // Không lọc
    } else {
      cloneBins = cloneBins.filter(bin => bin.address.includes(filterStreet));
      console.log('After filterStreet:', cloneBins.length, 'bins remaining');
    }

    if (filterConnection === 'Kết nối') {
      // Không lọc
    } else {
      cloneBins = cloneBins.filter(bin => {
        const isConnected = bin.internet === 0 || bin.internet === '0';
        console.log(`Bin ${bin.id}: internet=${bin.internet}, type=${typeof bin.internet}, isConnected=${isConnected}, filterConnection=${filterConnection}`);
        if (filterConnection === 'connected') {
          return isConnected;
        } else if (filterConnection === 'disconnect') {
          return !isConnected;
        }
        return true;
      });
      console.log('After filterConnection:', cloneBins.length, 'bins remaining');
    }

    if (filterWarning === 'Cảnh báo') {
      // Không lọc
    } else if (filterWarning === 'Có') {
      cloneBins = cloneBins.filter(bin => (
        bin.binUnits[0].fault === 1 ||
        bin.binUnits[1].fault === 1 ||
        bin.binUnits[2].fault === 1
      ));
      console.log('After filterWarning (Có):', cloneBins.length, 'bins remaining');
    } else {
      cloneBins = cloneBins.filter(bin => (
        bin.binUnits[0].fault === 0 &&
        bin.binUnits[1].fault === 0 &&
        bin.binUnits[2].fault === 0
      ));
      console.log('After filterWarning (Không):', cloneBins.length, 'bins remaining');
    }

    if (filterOrganic === 'filter') {
      // Không lọc
    } else if (filterOrganic === 'high') {
      cloneBins = cloneBins.filter(bin => parseInt(bin.binUnits[1].level, 10) > 90);
      console.log('After filterOrganic (high):', cloneBins.length, 'bins remaining');
    } else if (filterOrganic === 'medium') {
      cloneBins = cloneBins.filter(bin => parseInt(bin.binUnits[1].level, 10) < 90 && parseInt(bin.binUnits[1].level, 10) > 70);
      console.log('After filterOrganic (medium):', cloneBins.length, 'bins remaining');
    } else {
      cloneBins = cloneBins.filter(bin => parseInt(bin.binUnits[1].level, 10) < 70);
      console.log('After filterOrganic (low):', cloneBins.length, 'bins remaining');
    }

    console.log('Final filtered bins:', cloneBins);
    setFilteredBins(cloneBins); // Cập nhật filteredBins thay vì Bins
  }, [filterConnection, filterWarning, filterStreet, filterOrganic, Bins]);

  const handlefilterConnection = (event) => {
    const selectedFilterConnection = event.target.value;
    setFilterConnection(selectedFilterConnection);
    // Đặt lại các bộ lọc khác về giá trị mặc định
    setfilterWarning('Cảnh báo');
    setfilterOrganic('filter');
    setfilterStreet('');
  };

  const handlefilterWarning = (event) => {
    const selectedFilterWarning = event.target.value;
    setfilterWarning(selectedFilterWarning);
  };

  const handleSearchStreet = (event) => {
    const selectedFilterStreet = event.target.value;
    setfilterStreet(selectedFilterStreet);
  };

  const handleFilterOrganic = (event) => {
    const selectedFilterOrganic = event.target.value;
    setfilterOrganic(selectedFilterOrganic);
  };

  let csvData = [
    [
      "Địa chỉ", 
      "Lỗi động cơ", 
      "Kết nối", 
      "Mức pin", 
      "Không Tái chế - Số lần ép", 
      "Không Tái chế - Lỗi động cơ", 
      "Không Tái chế - Báo đầy", 
      "Không Tái chế - Mức độ đầy", 
      "Không Tái chế - Báo hỏa hoạn", 
      "Không Tái chế - Báo rung", 
      "Không Tái chế - Trạng thái kết nối", 
      "Thực phẩm - Số lần ép", 
      "Thực phẩm - Lỗi động cơ", 
      "Thực phẩm - Báo đầy", 
      "Thực phẩm - Mức độ đầy", 
      "Thực phẩm - Báo hỏa hoạn", 
      "Thực phẩm - Báo rung", 
      "Thực phẩm - Trạng thái kết nối", 
      "Tái chế - Số lần ép", 
      "Tái chế - Lỗi động cơ", 
      "Tái chế - Báo đầy", 
      "Tái chế - Mức độ đầy", 
      "Tái chế - Báo hỏa hoạn", 
      "Tái chế - Báo rung", 
      "Tái chế - Trạng thái kết nối", 
      "Internet", 
      "Pin"
    ]
  ];

  const getBins = (event, done) => {
    if (filteredBins && filteredBins.length > 0) {
      filteredBins.forEach((bin) => {
        let arr = [];
        arr[0] = `${bin.address}`; // Địa chỉ
        arr[1] = (bin.binUnits[0].fault === 1 || bin.binUnits[1].fault === 1 || bin.binUnits[2].fault === 1) ? 'Có' : 'Không'; // Lỗi động cơ
        arr[2] = (bin.internet === 0 || bin.internet === '0') ? 'Có kết nối' : 'Mất kết nối'; // Kết nối
        arr[3] = bin.battery; // Mức pin

        // Không Tái chế (binUnits[0])
        arr[4] = bin.binUnits[0].compressCnt || 0; // Số lần ép
        arr[5] = bin.binUnits[0].fault === 1 ? 'Có' : 'Không'; // Lỗi động cơ
        arr[6] = bin.binUnits[0].fullCnt ? 'Full' : ''; // Báo đầy
        arr[7] = bin.binUnits[0].level || 0; // Mức độ đầy
        arr[8] = bin.binUnits[0].flame === 1 ? 'Có' : 'Không'; // Báo hỏa hoạn
        arr[9] = bin.binUnits[0].vibration === 1 ? 'Có' : 'Không'; // Báo rung
        arr[10] = bin.binUnits[0].status === 0 ? 'Kết nối' : 'Mất kết nối'; // Trạng thái kết nối

        // Thực phẩm (binUnits[1])
        arr[11] = bin.binUnits[1].compressCnt || 0; // Số lần ép
        arr[12] = bin.binUnits[1].fault === 1 ? 'Có' : 'Không'; // Lỗi động cơ
        arr[13] = bin.binUnits[1].fullCnt ? 'Full' : ''; // Báo đầy
        arr[14] = bin.binUnits[1].level || 0; // Mức độ đầy
        arr[15] = bin.binUnits[1].flame === 1 ? 'Có' : 'Không'; // Báo hỏa hoạn
        arr[16] = bin.binUnits[1].vibration === 1 ? 'Có' : 'Không'; // Báo rung
        arr[17] = bin.binUnits[1].status === 0 ? 'Kết nối' : 'Mất kết nối'; // Trạng thái kết nối

        // Tái chế (binUnits[2])
        arr[18] = bin.binUnits[2].compressCnt || 0; // Số lần ép
        arr[19] = bin.binUnits[2].fault === 1 ? 'Có' : 'Không'; // Lỗi động cơ
        arr[20] = bin.binUnits[2].fullCnt ? 'Full' : ''; // Báo đầy
        arr[21] = bin.binUnits[2].level || 0; // Mức độ đầy
        arr[22] = bin.binUnits[2].flame === 1 ? 'Có' : 'Không'; // Báo hỏa hoạn
        arr[23] = bin.binUnits[2].vibration === 1 ? 'Có' : 'Không'; // Báo rung
        arr[24] = bin.binUnits[2].status === 0 ? 'Kết nối' : 'Mất kết nối'; // Trạng thái kết nối

        // Bin-level fields
        arr[25] = (bin.internet === 0 || bin.internet === '0') ? 'Có kết nối' : 'Mất kết nối'; // Internet
        arr[26] = bin.battery; // Pin

        csvData.push(arr);
      });
      setDataExport(csvData);
    }
  };

  console.log('Bins:', Bins);
  console.log('Filtered Bins:', filteredBins);

  return (
    <div className='father-bins'>
      <div className='header'>
        <div className='div-display-couter'>
          {IsGetBufferSuccessful && <h4>{`Đang hiển thị ${filteredBins.length} thùng rác`}</h4>}
        </div>
        <div className='header-buttons'>
          <Link to={'/addnewbin'}>
            <button type="button" className="btn btn-success" style={{ marginRight: '10px' }}>
              Thêm thùng rác
            </button>
          </Link>
          <CSVLink
            data={dataExport}
            filename={"my-file.csv"}
            className="btn btn-success"
            asyncOnClick={true}
            onClick={getBins}
          >
            Xuất file Excel
          </CSVLink>
        </div>
      </div>

      <Table bordered hover className='table'>
        <thead>
          <tr className='header-table'>
            <th rowSpan='2'>
              <div>Vị trí</div>
              <div className='form-search-street'>
                <div className="form-input">
                  <input
                    type="search"
                    id="form1"
                    className="form-control"
                    placeholder='Tên đường'
                    onChange={handleSearchStreet}
                    value={filterStreet}
                  />
                </div>
              </div>
            </th>
            <th rowSpan='2'>
              <div>Lỗi động cơ</div>
              <div className='filter-warning filter'>
                <Form.Select
                  aria-label="Default select example"
                  onChange={handlefilterWarning}
                  value={filterWarning}
                >
                  <option value="Cảnh báo">Tất cả</option>
                  <option value="Có">Có lỗi</option>
                  <option value="Không">Không lỗi</option>
                </Form.Select>
              </div>
            </th>
            <th rowSpan='2'>
              <div>Kết nối Internet</div>
              <div className='filter-connection filter'>
                <Form.Select
                  aria-label="Default select example"
                  onChange={handlefilterConnection}
                  value={filterConnection}
                >
                  <option value="Kết nối">Tất cả</option>
                  <option value="connected">Đang kết nối</option>
                  <option value="disconnect">Mất kết nối</option>
                </Form.Select>
              </div>
            </th>
            <th rowSpan='2'>Năng lượng (%)</th>
            <td colSpan="3" style={{ textAlign: 'center', fontWeight: 'bold' }}>Mức đầy</td>
            <th rowSpan='2'></th>
          </tr>
          <tr>
            <th scope="col">
              Không tái chế
              <div className='select'>
                <Form.Select
                  onChange={handleFilterOrganic}
                  value={filterOrganic}
                  aria-label="Default select example"
                >
                  <option value="filter">Tất cả</option>
                  <option value="high">Cao</option>
                  <option value="medium">Trung bình</option>
                  <option value="low">Thấp</option>
                </Form.Select>
              </div>
            </th>
            <th scope="col">
              Thực phẩm
              <div className='select'>
                <Form.Select aria-label="Default select example">
                  <option>Tất cả</option>
                  <option value="1">Cao</option>
                  <option value="2">Trung bình</option>
                  <option value="2">Thấp</option>
                </Form.Select>
              </div>
            </th>
            <th scope="col">
              Tái chế
              <div className='select'>
                <Form.Select aria-label="Default select example">
                  <option>Tất cả</option>
                  <option value="1">Cao</option>
                  <option value="2">Trung bình</option>
                  <option value="2">Thấp</option>
                </Form.Select>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {IsGetBufferSuccessful && filteredBins.map((item, index) =>
            <tr key={index} className=''>
              <td className='location'>
                <div>{`${item.address}`}</div>
                <div>
                  <Link
                    to="/map"
                    state={{
                      latBin: item.latitude,
                      lngBin: item.longtitude
                    }}
                  >
                    <button type="button" className="btn btn-info">Xem vị trí</button>
                  </Link>
                </div>
              </td>
              <td className={
                (item.binUnits[0].fault === 1 ||
                item.binUnits[1].fault === 1 ||
                item.binUnits[2].fault === 1) ? 'bg-danger' : ''
              }>
                {(item.binUnits[0].fault === 1 ||
                  item.binUnits[1].fault === 1 ||
                  item.binUnits[2].fault === 1) ? <BiSolidError className='fault'/> : ''}
              </td>
              <td>
                {(item.internet === 0 || item.internet === '0') ?
                  <FaCircle className='connecting'/> :
                  <FaTimesCircle className='disconnect'/>
                }
              </td>
              <td>{item.battery}</td>
              <td className={parseInt(item.binUnits[0].level, 10) > 90 ? 'bg-danger' : ''}>{item.binUnits[0].level}</td>
              <td className={parseInt(item.binUnits[1].level, 10) > 90 ? 'bg-danger' : ''}>{item.binUnits[1].level}</td>
              <td className={parseInt(item.binUnits[2].level, 10) > 90 ? 'bg-danger' : ''}>{item.binUnits[2].level}</td>
              <td className='td-action'>
                <Link
                  to={`/bin/${item.id}/detail`}
                  onClick={() => sessionStorage.setItem('scrollPosition', window.pageYOffset)}
                >
                  <button type="button" className="btn btn-info">
                    <IoInformationCircle className='icon-infor'/>
                  </button>
                </Link>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}

export default Bin;