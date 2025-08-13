import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import _ from 'lodash';
import DateTimePicker from 'react-datetime-picker'; // Sử dụng DateTimePicker
import 'react-datetime-picker/dist/DateTimePicker.css'; // CSS cho DateTimePicker
import 'react-calendar/dist/Calendar.css'; // CSS cho calendar
import 'react-clock/dist/Clock.css'; // CSS cho clock
import Button from 'react-bootstrap/Button';
import './Point.scss';
import { UserContext } from '../context/usercontext';
import { useContext } from 'react';
import { url } from '../services/UserService';

function PointUser() {
  const [valueFrom, setValueFrom] = useState(new Date());
  const [valueTo, setValueTo] = useState(new Date());
  const [initialHistory, setInitialHistory] = useState([]);
  const [historyA, setHistoryA] = useState([]);
  const [history, setHistory] = useState([]);
  const { user, logout, handleRepair, handleFull, UserLogin, setUserLogin } = useContext(UserContext);

  const getPoint = async () => {
    let success = false;
    while (!success) {
      try {
        const response = await axios.get(`${url}/PointChange/GetPointChangedHistory?userId=${UserLogin.id}`);
        const citiesData = response.data;
        console.log('citiesData', citiesData);
        setHistory(citiesData);
        setHistoryA(citiesData);
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
    getPoint();
  }, []);

  const filterDateTime = () => {
    const cloneHistory = _.cloneDeep(historyA);
    const filteredHistory = cloneHistory.filter(item => {
      const itemDateTime = new Date(item.pointChangedTime);
      return itemDateTime >= valueFrom && itemDateTime <= valueTo;
    });
    setHistory(filteredHistory);
  };

  function formatDateTime(input) {
    const [datePart, timePart] = input.split('T');
    const [hours, minutes, seconds] = timePart.split(':');
    const [year, month, day] = datePart.split('-');
    return `${hours}:${minutes}:${seconds.split('.')[0]} ${day}/${month}/${year}`;
  }

  const input = "2024-11-20T03:09:52.8637755";
  const output = formatDateTime(input);
  console.log(output);

  console.log('UserLogin', UserLogin);
  console.log('history', history);

  return (
    <div className='father-history'>
      <div className="input-group">
        <div>
          <div>Thời gian bắt đầu</div>
          <div className="father-chart">
            <DateTimePicker
              onChange={setValueFrom}
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
          <div>Thời gian kết thúc</div>
          <div className="father-chart">
            <DateTimePicker
              onChange={setValueTo}
              value={valueTo}
              format="dd/MM/yyyy HH:mm"
              disableCalendar={true}
              disableClock={true}
              clearIcon={null}
              calendarIcon={null}
            />
          </div>
        </div>
        <div className='btn-see'>
          <Button
            onClick={filterDateTime}
            variant="primary"
          >
            Xem
          </Button>
        </div>
      </div>
      <Table striped bordered hover className='table'>
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Điểm cũ</th>
            <th>Điểm mới</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item, index) => (
            <tr key={index}>
              <td>{formatDateTime(item.pointChangedTime)}</td>
              <td>{item.oldPoint}</td>
              <td>{item.newPoint}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default PointUser;