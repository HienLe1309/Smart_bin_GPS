import React from 'react';
import './FilterOption.scss';

function FilterOptions({ show, handleTypeSelected }) {
  const types = [
    { label: 'Thực phẩm', key: 'organic' },
    { label: 'Tái chế', key: 'recyclable' },
    { label: 'Không tái chế', key: 'nonRecyclable' },
  ];

  return (
    <div className={`filterOptions ${show ? 'show' : ''}`}>
      {types.map((type) => (
        <div className="filterOptions-item" key={type.key}>
          <input
            type="checkbox"
            id={type.key}
            onChange={(e) => handleTypeSelected(type.key, e.target.checked)}
          />
          <label htmlFor={type.key}>{type.label}</label>
        </div>
      ))}
    </div>
  );
}

export default FilterOptions;