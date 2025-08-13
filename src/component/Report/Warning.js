import React, { useState } from 'react';
import './warning.scss';
import { useParams } from 'react-router-dom';
import DateTimePicker from 'react-datetime-picker';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { url } from '../../services/UserService';

function Warning() {
    const { id } = useParams();
    const [valueFrom, onChangeFrom] = useState(new Date()); // Khởi tạo với ngày hiện tại
    const [valueTo, onChangeTo] = useState(new Date()); // Khởi tạo với ngày hiện tại
    const [filteredBins, setFilteredBins] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [displayedBins, setDisplayedBins] = useState([]);

    // Hàm định dạng ngày thành chuỗi YYYY-MM-DD HH:mm:ss
    const formatDateForAPI = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Hàm ánh xạ id sang loại cảnh báo
    const getWarningType = (id) => {
        switch (id) {
            case 8: return 'Rung động';
            case 7: return 'Hỏa hoạn';
            case 2: return 'Lỗi động cơ';
            case 6: return 'Lỗi mất kết nối';
            case 11: return 'Lỗi mất Internet';
            default: return 'Không xác định';
        }
    };

    // Hàm ánh xạ hậu tố binUnitId sang loại thùng
    const getBinType = (suffix) => {
        switch (suffix) {
            case 'OR': return 'Thực phẩm';
            case 'RI': return 'Tái chế';
            case 'NI': return 'Không tái chế';
            default: return 'Không xác định';
        }
    };

    // Hàm định dạng thời gian hiển thị
    const formatDisplayDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    };

    // Lọc dữ liệu dựa trên khoảng thời gian
    const filterDateTime = async () => {
        if (!valueFrom || !valueTo) {
            toast.warn('Vui lòng chọn cả ngày bắt đầu và ngày kết thúc');
            return;
        }

        if (valueFrom > valueTo) {
            toast.error('Ngày bắt đầu phải trước ngày kết thúc');
            return;
        }

        try {
            const timeStamp1 = formatDateForAPI(valueFrom);
            const timeStamp2 = formatDateForAPI(valueTo);
            const response = await axios.get(
                `${url}/ErrorHistory/GetErrorHistoriesFromDateTime1ToDateTime2?timeStamp1=${timeStamp1}&timeStamp2=${timeStamp2}`
            );

            const warnings = response.data.map((item) => {
                const binUnitId = item.binUnitId;
                const binIdMatch = binUnitId.match(/^(BIN\d+)/);
                const binId = binIdMatch ? binIdMatch[1] : binUnitId;
                const binTypeSuffix = binUnitId.replace(binId, '');

                return {
                    binId: binId,
                    binType: getBinType(binTypeSuffix),
                    warningType: getWarningType(item.id),
                    timeStamp: item.timeStamp,
                };
            });

            setFilteredBins(warnings);
            setDisplayedBins(warnings);

            if (warnings.length === 0) {
                toast.info('Không tìm thấy dữ liệu trong khoảng thời gian đã chọn');
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách lỗi:', error);
            toast.error('Không thể tải danh sách lỗi');
        }
    };

    // Hàm xử lý tìm kiếm
    const handleSearch = () => {
        if (!searchQuery.trim()) {
            setDisplayedBins(filteredBins);
            return;
        }

        const lowerCaseQuery = searchQuery.toLowerCase();
        const filtered = filteredBins.filter((warning) => {
            return (
                warning.binId.toLowerCase().includes(lowerCaseQuery) ||
                warning.binType.toLowerCase().includes(lowerCaseQuery) ||
                warning.warningType.toLowerCase().includes(lowerCaseQuery) ||
                formatDisplayDate(warning.timeStamp).toLowerCase().includes(lowerCaseQuery)
            );
        });

        setDisplayedBins(filtered);

        if (filtered.length === 0) {
            toast.info('Không tìm thấy kết quả phù hợp');
        }
    };

    // Xử lý khi nhấn Enter trong input tìm kiếm
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className='father-detail'>
            <div className='div-father-collection'>
                <div className="input-group">
                    <div className="form-outline">
                        <input
                            type="search"
                            id="form1"
                            className="form-control"
                            placeholder="Tìm theo ID, Loại thùng, Loại cảnh báo hoặc Thời điểm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSearch}
                        >
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                    <div>
                        <div>Ngày bắt đầu</div>
                        <div className="father-chart">
                            <DateTimePicker
                                onChange={onChangeFrom}
                                value={valueFrom}
                                format="dd/MM/yyyy HH:mm"
                                maxDate={new Date()}
                                disableCalendar={true}
                                disableClock={true}
                                clearIcon={null}
                                calendarIcon={null}
                            />
                        </div>
                    </div>
                    <div>
                        <div>Ngày kết thúc</div>
                        <div className="father-chart">
                            <DateTimePicker
                                onChange={onChangeTo}
                                value={valueTo}
                                format="dd/MM/yyyy HH:mm"
                                maxDate={new Date()}
                                disableCalendar={true}
                                disableClock={true}
                                clearIcon={null}
                                calendarIcon={null}
                            />
                        </div>
                    </div>
                    <div className='btn-see'>
                        <Button variant="primary" onClick={filterDateTime}>
                            Xem
                        </Button>
                    </div>
                </div>
                <div className='table'>
                    <Table striped bordered hover className='table'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Loại thùng</th>
                                <th>Loại cảnh báo</th>
                                <th>Thời điểm</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedBins.map((warning, index) => (
                                <tr key={index}>
                                    <td>{warning.binId}</td>
                                    <td>{warning.binType}</td>
                                    <td>{warning.warningType}</td>
                                    <td>{formatDisplayDate(warning.timeStamp)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

export default Warning;