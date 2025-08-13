// import React, { useState,useEffect,useRef}from 'react'

// import './listBin.scss'
// import { RiDeleteBin6Fill } from "react-icons/ri";
// function ListBin({ listBin, show, handleUpdateListBin, handleBinSelected }) {

// const [listColection, setlistColection] = useState([])
// const [isChecked, setIsChecked] = useState(false);
// const [previousBin, setpreviousBin] = useState({});

// const [selectedBin, setselectedBin] = useState({});



// const handleAddBintoListCollection = (e,item) => {
//     if(e){       
//             setlistColection([...listColection, item])         
//     }
//     else{
//         const index = listColection.indexOf(item);
//         const newItems = [...listColection]; // Tạo một bản sao của mảng hiện tại
//         newItems.splice(index, 1); // Xóa một phần tử tại chỉ số đã cho
//         setlistColection(newItems);
//     }  
// }
// const handleCheckboxChange = (e,item) => {
//     setIsChecked(e);
// };

//   // useEffect(()=>{

//   // },[isChecked])

//   useEffect(()=>{
    
//     handleBinSelected(selectedBin)

//   },[selectedBin])


//   const updateListBin = () => {
//         handleUpdateListBin(listColection)
//   }
//   const handleSelectedBin = (item) => {

//         setselectedBin(item)
    
//   }


// // console.log(listColection)
//   return (
//     <div className='listBin'>
//       {listBin.map((item,index)=>
      
//       <div className='listBin-item'
//             key={index}
//       >
//                     <div className='listBin-item-position'
//                           onClick={()=>handleSelectedBin(item)}
//                     >
//                                     <input  type="checkbox"          
//                                             id={ `${index}`}                         
//                                             onChange={(e)=>handleAddBintoListCollection(e.target.checked,item)}
//                                     />
//                                     <label for={ `${index}`}>{`${item.district_name}-${item.street_name}`}</label>
                                                               
//                     </div>
//                     <div className='listBin-item-icon'>
//                         <div>                                   
//                                     Thực phẩm <RiDeleteBin6Fill className={item.connection === 'disconnect' ? 'BLACK': item.available.Organic === 'HIGH' ? 'RED' : (item.available.Organic === 'MEDIUM' ? "YELLOW" : "GREEN")}/>
//                         </div>
//                         <div>                                   
//                                     Tái chế <RiDeleteBin6Fill className={item.connection === 'disconnect' ? 'BLACK' : item.available.Inorganic_recyclables === 'HIGH' ? 'RED' : item.available.Inorganic_recyclables === 'MEDIUM' ? "YELLOW" : "GREEN"}/>
//                         </div>
//                         <div>                                        
//                                     Khác <RiDeleteBin6Fill className={item.connection === 'disconnect' ? 'BLACK' : item.available.Non_recyclables_inorganic === 'HIGH' ? 'RED' : item.available.Non_recyclables_inorganic === 'MEDIUM' ? "YELLOW" : "GREEN"}/>
//                         </div>
                        
//                     </div>
//       </div>)}

//       <div className='div-buton'>
//           <button type="button" class="btn btn-info"
//                     onClick={updateListBin}
//           >Thu gom</button>
//       </div>
//     </div>
//   )
// }

// export default ListBin
import React, { useState, useEffect } from 'react';
import './listBin.scss';
import { RiDeleteBin6Fill } from 'react-icons/ri';

function ListBin({ listBin, show, handleUpdateListBin, handleBinSelected }) {
  const [listColection, setListColection] = useState([]);
  const [selectedBin, setSelectedBin] = useState({});

  const handleAddBintoListCollection = (e, item) => {
    if (e) {
      setListColection([...listColection, item]);
      console.log('Added to listColection:', item); // Kiểm tra item được thêm
    } else {
      const index = listColection.indexOf(item);
      const newItems = [...listColection];
      newItems.splice(index, 1);
      setListColection(newItems);
      console.log('Removed from listColection:', item); // Kiểm tra item bị xóa
    }
  };

  useEffect(() => {
    handleBinSelected(selectedBin);
  }, [selectedBin, handleBinSelected]);

  const updateListBin = () => {
    console.log('listColection before update:', listColection); // Kiểm tra danh sách trước khi gửi
    handleUpdateListBin(listColection);
  };

  const handleSelectedBin = (item) => {
    setSelectedBin(item);
  };

  const getBinLevelStatus = (level) => {
    const parsedLevel = parseInt(level, 10);
    if (isNaN(parsedLevel)) return 'LOW';
    if (parsedLevel > 90) return 'HIGH';
    if (parsedLevel > 70) return 'MEDIUM';
    return 'LOW';
  };

  const getBinLevelColor = (level) => {
    const parsedLevel = parseInt(level, 10);
    if (isNaN(parsedLevel)) return 'GREEN';
    if (parsedLevel > 90) return 'RED';
    if (parsedLevel > 70) return 'YELLOW';
    return 'GREEN';
  };

  return (
    <div className={`listBin ${show ? 'show' : ''}`}>
      {listBin.map((item, index) => (
        <div className="listBin-item" key={index}>
          <div className="listBin-item-position" onClick={() => handleSelectedBin(item)}>
            <input
              type="checkbox"
              id={`${index}`}
              onChange={(e) => handleAddBintoListCollection(e.target.checked, item)}
            />
            <label htmlFor={`${index}`}>{`${item.district_name}-${item.street_name}`}</label>
          </div>
          <div className="listBin-item-icon">
            <div>
              Thực phẩm{' '}
              <RiDeleteBin6Fill
                className={
                  item.internet === 1
                    ? 'BLACK'
                    : getBinLevelColor(item.binUnits?.[1]?.level || 0)
                }
              />
            </div>
            <div>
              Tái chế{' '}
              <RiDeleteBin6Fill
                className={
                  item.internet === 1
                    ? 'BLACK'
                    : getBinLevelColor(item.binUnits?.[2]?.level || 0)
                }
              />
            </div>
            <div>
              Khác{' '}
              <RiDeleteBin6Fill
                className={
                  item.internet === 1
                    ? 'BLACK'
                    : getBinLevelColor(item.binUnits?.[0]?.level || 0)
                }
              />
            </div>
          </div>
        </div>
      ))}
      <div className="div-buton">
        <button type="button" className="btn btn-info" onClick={updateListBin}>
          Thu gom
        </button>
      </div>
    </div>
  );
}

export default ListBin;
