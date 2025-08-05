import React, { useState } from 'react';
import '../../../../theme/CarOwner/Vehicle.css';

const VehicleListRegister = () => {
  const [vehicles, setVehicles] = useState([
    { id: 1, number: '12가 3456', type: '대형 트럭', capacity: '10톤', date: '2024-01-01' },
    { id: 2, number: '98나 7654', type: '소형 트럭', capacity: '2.5톤', date: '2024-02-15' },
    { id: 3, number: '78다 1234', type: '탑차', capacity: '5톤', date: '2024-03-20' },
  ]);

  const [form, setForm] = useState({ number: '', type: '', capacity: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const today = new Date().toISOString().split('T')[0];
    const newVehicle = {
      id: Date.now(),
      ...form,
      date: today,
    };
    setVehicles([...vehicles, newVehicle]);
    setForm({ number: '', type: '', capacity: '' });
  };

  return (
    <div className="vehicle-wrapper">
      <div className="vehicle-list">
        <h2>차량 리스트</h2>
        <table>
          <thead>
            <tr>
              <th>차량번호</th>
              <th>차종</th>
              <th>적재 용량</th>
              <th>등록일자</th>
              <th>수정</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>{v.number}</td>
                <td>{v.type}</td>
                <td>{v.capacity}</td>
                <td>{v.date}</td>
                <td><button className="edit-btn">수정</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="vehicle-register">
        <h3>차량 등록</h3>
        <div className="form-group">
          <label>차량번호</label>
          <input type="text" name="number" value={form.number} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>차종</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="">차종 선택</option>
            <option value="소형 트럭">소형 트럭</option>
            <option value="대형 트럭">대형 트럭</option>
            <option value="탑차">탑차</option>
          </select>
        </div>
        <div className="form-group">
          <label>적재 용량</label>
          <input type="text" name="capacity" value={form.capacity} onChange={handleChange} />
        </div>
        <button className="submit-btn" onClick={handleSubmit}>등록</button>
      </div>
    </div>
  );
};

export default VehicleListRegister;