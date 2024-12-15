import React, { useState } from 'react';
import './Slider.css';

function Slider({ label, min, max }) {
  const [value, setValue] = useState(50);

  const handleChange = (e) => setValue(e.target.value);

  return (
    <div className="slider">
      <label>
        {label}
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleChange}
        />
      </label>
      <div className="slider-labels">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default Slider;
