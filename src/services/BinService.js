// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { url } from './UserService';

// export const processBinsAndUpdatePoints = async (userName) => {
//   try {
//     // Step 1: Fetch user details by userName
//     const userResponse = await axios.get(`${url}/User/GetUserByUserName?userName=${userName}`);
//     const user = userResponse.data;
//     if (!user || !user.id || !user.identificationNumber || !user.point) {
//       throw new Error('Không tìm thấy thông tin người dùng');
//     }
//     const { id, identificationNumber, point: currentPoints } = user;

//     // Step 2: Fetch all bins
//     const binsResponse = await axios.get(`${url}/Bins/GetAllBins`);
//     const bins = binsResponse.data;

//     // Step 3: Collect and count QR occurrences matching the user's identificationNumber
//     let qrMatchCount = 0;
//     for (const bin of bins) {
//       if (bin.qr && bin.qr !== '') {
//         let qrValues = [];
//         try {
//           const parsed = JSON.parse(bin.qr);
//           qrValues = Array.isArray(parsed) ? parsed : [parsed];
//         } catch (e) {
//           console.warn(`Failed to parse QR for bin ${bin.id}: ${bin.qr}`);
//           qrValues = [bin.qr]; // Fallback to use qr as-is if parsing fails
//         }
//         for (const qrValue of qrValues) {
//           if (qrValue === identificationNumber) {
//             qrMatchCount++;
//           }
//         }
//       }
//     }

//     // Step 4: Update user points if there are matches
//     if (qrMatchCount > 0) {
//       const newPoint = currentPoints + qrMatchCount;

//       try {
//         const updateResponse = await axios.patch(
//           `${url}/PointChange/UpdatePoint?id=${id}`,
//           { point: newPoint }
//         );

//         if (updateResponse) {
//           toast.success(`Điểm của người dùng ${userName} được cập nhật: ${newPoint}`);
//         } else {
//           toast.error('Không thể cập nhật điểm');
//         }
//       } catch (error) {
//         console.error('Error updating points:', error);
//         toast.error('Lỗi khi cập nhật điểm');
//       }
//     } else {
//       toast.info(`Không có mã QR nào khớp với người dùng ${userName}`);
//     }

//     // Step 5: Clear QR codes from all bins
//     for (const bin of bins) {
//       if (bin.qr && bin.qr !== '') {
//         try {
//           await axios.delete(
//             `${url}/Bins/DeleteQRByBinIdAndQr?binId=${bin.id}&qR=${bin.qr}`
//           );
//           toast.success(`Đã xóa QR cho thùng rác ${bin.id}`);
//         } catch (error) {
//           console.error('Error deleting QR code:', error);
//           toast.error(`Lỗi khi xóa QR cho thùng rác ${bin.id}`);
//         }
//       }
//     }
//   } catch (error) {
//     console.error('Error processing bins:', error);
//     toast.error('Lỗi khi xử lý dữ liệu thùng rác');
//   }
// };
import axios from 'axios';
import { toast } from 'react-toastify';
import { url } from './UserService';

export const processBinsAndUpdatePoints = async (userName) => {
  try {
    // Step 1: Fetch user details by userName
    const userResponse = await axios.get(`${url}/User/GetUserByUserName?userName=${userName}`);
    const user = userResponse.data;
    if (!user || !user.id || !user.identificationNumber) {
      throw new Error('Không tìm thấy thông tin người dùng');
    }
    const { id, identificationNumber, point: currentPoints } = user;

    // Step 2: Fetch all bins
    const binsResponse = await axios.get(`${url}/Bins/GetAllBins`);
    const bins = binsResponse.data;

    // Step 3: Collect and count QR occurrences matching the user's identificationNumber
    let qrMatchCount = 0;
    const matchedQRs = []; // Lưu các mã QR khớp và binId tương ứng
    for (const bin of bins) {
      if (bin.qr && bin.qr !== '') {
        let qrValues = [];
        try {
          const parsed = JSON.parse(bin.qr);
          qrValues = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          console.warn(`Failed to parse QR for bin ${bin.id}: ${bin.qr}`);
          qrValues = [bin.qr];
        }
        for (const qrValue of qrValues) {
          if (qrValue === identificationNumber) {
            qrMatchCount++;
            matchedQRs.push({ binId: bin.id, qrValue }); // Lưu binId và qrValue khớp
          }
        }
      }
    }

    // Step 4: Update user points if there are matches
    if (qrMatchCount > 0) {
      const newPoint = currentPoints + qrMatchCount;
      try {
        const updateResponse = await axios.patch(
          `${url}/PointChange/UpdatePoint?id=${id}`,
          { point: newPoint }
        );
        if (updateResponse.status === 200) {
          toast.success(`Điểm của người dùng ${userName} được cập nhật: ${newPoint}`);
        } else {
          toast.error('Không thể cập nhật điểm');
        }
      } catch (error) {
        console.error('Error updating points:', error);
        toast.error('Lỗi khi cập nhật điểm');
      }
    } else {
      toast.info(`Không có mã QR nào khớp với người dùng ${userName}`);
    }

    // Step 5: Clear only matched QR codes
    for (const { binId, qrValue } of matchedQRs) {
      try {
        const encodedQr = encodeURIComponent(qrValue);
        console.log(`Sending DELETE request for bin ${binId}, QR ${qrValue}`);
        const response = await axios.delete(
          `${url}/Bins/DeleteQRByBinIdAndQr?binId=${binId}&qR=${encodedQr}`
        );
        if (response.status === 200 || response.status === 204) {
          toast.success(`Đã xóa mã QR ${qrValue} cho thùng rác ${binId}`);
        } else {
          toast.error(`Không thể xóa mã QR ${qrValue} cho thùng rác ${binId}`);
        }
      } catch (error) {
        console.error(`Error deleting QR ${qrValue} for bin ${binId}:`, error);
        toast.error(`Lỗi khi xóa mã QR ${qrValue} cho thùng rác ${binId}`);
      }
    }

    // Step 6: Verify QR codes are cleared
    const updatedBinsResponse = await axios.get(`${url}/Bins/GetAllBins`);
    const updatedBins = updatedBinsResponse.data;
    let allCleared = true;
    for (const bin of updatedBins) {
      if (bin.qr && bin.qr !== '' && bin.qr !== '[]') {
        let qrValues = [];
        try {
          const parsed = JSON.parse(bin.qr);
          qrValues = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          qrValues = [bin.qr];
        }
        // Kiểm tra xem identificationNumber có còn trong qr hay không
        if (qrValues.includes(identificationNumber)) {
          console.warn(`QR ${identificationNumber} for bin ${bin.id} was not cleared: ${bin.qr}`);
          toast.warn(`QR ${identificationNumber} cho thùng rác ${bin.id} chưa được xóa: ${bin.qr}`);
          allCleared = false;
        }
      }
    }
    if (allCleared) {
      toast.success('Tất cả mã QR khớp đã được xóa thành công');
    }
  } catch (error) {
    console.error('Error processing bins:', error);
    toast.error('Lỗi khi xử lý dữ liệu thùng rác');
  }
};