import { useEffect, useState } from "react";
import "../../../../theme/CarOwner/Vehicle.css";
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
  setPrimaryVehicle,
  deleteVehicle,
} from "../../../../api/CarOwnerApi/CarOwnerVehiclesApi";

const VehicleListRegister = () => {
  // 페이지 데이터
  const [pageData, setPageData] = useState({ content: [], number: 0, size: 10, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // 등록 폼
  const [form, setForm] = useState({ plateNumber: "", type: "", model: "", capacity: "", primary: false });

  // 수정 모달
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ type: "", model: "", capacity: "" });

  const load = async (page = 0) => {
    setLoading(true); setErr(null);
    try {
      const data = await fetchVehicles({ page, size: pageData.size });
      setPageData(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async () => {
    if (!form.plateNumber || !form.type) return alert("차량번호와 차종은 필수입니다.");
    try {
      await createVehicle({
        plateNumber: form.plateNumber.trim(),
        type: form.type.trim(),
        model: form.model?.trim() || "",
        capacity: form.capacity ? Number(form.capacity) : null,
        primary: !!form.primary,
      });
      setForm({ plateNumber: "", type: "", model: "", capacity: "", primary: false });
      await load(0);
      alert("등록 완료");
    } catch (e) {
      alert(e.message);
    }
  };

  const togglePrimary = async (id, nowPrimary) => {
    try {
      await setPrimaryVehicle(id, !nowPrimary);
      await load(pageData.number);
    } catch (e) {
      alert(e.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("정말 삭제할까요?")) return;
    try {
      await deleteVehicle(id);
      // 현재 페이지에서 하나 삭제되어 비는 경우 이전 페이지로 보정할 수도 있음
      await load(pageData.number);
    } catch (e) {
      alert(e.message);
    }
  };

  const openEdit = (v) => {
    setEditId(v.id);
    setEditForm({
      type: v.type || "",
      model: v.model || "",
      capacity: v.capacity ?? "",
    });
    setEditOpen(true);
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  };

  const onEditSubmit = async () => {
    try {
      await updateVehicle(editId, {
        type: editForm.type?.trim() || null,
        model: editForm.model?.trim() || null,
        capacity: editForm.capacity !== "" ? Number(editForm.capacity) : null,
      });
      setEditOpen(false);
      await load(pageData.number);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="vehicle-wrapper">
      <div className="vehicle-list">
        <h2>차량 리스트</h2>

        {err && <div className="error">에러: {err}</div>}
        {loading ? (
          <div>불러오는 중...</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>기본</th>
                  <th>차량번호</th>
                  <th>차종</th>
                  <th>모델</th>
                  <th>적재 용량</th>
                  <th>상태</th>
                  <th>등록일</th>
                  <th>수정</th>
                  <th>삭제</th>
                </tr>
              </thead>
              <tbody>
                {pageData.content.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!v.primary}
                        onChange={() => togglePrimary(v.id, v.primary)}
                        title={v.primary ? "기본차량 해제" : "기본차량으로 설정"}
                      />
                    </td>
                    <td>{v.plateNumber}</td>
                    <td>{v.type}</td>
                    <td>{v.model ?? "-"}</td>
                    <td>{v.capacity}</td>
                    <td>{v.status ?? "-"}</td>
                    <td>{v.registeredAt?.replace?.("T", " ") ?? "-"}</td>
                    <td><button className="edit-btn" onClick={() => openEdit(v)}>수정</button></td>
                    <td><button className="edit-btn" onClick={() => remove(v.id)}>삭제</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pager" style={{ marginTop: 12 }}>
              <button disabled={pageData.number <= 0} onClick={() => load(pageData.number - 1)}>이전</button>
              <span style={{ margin: "0 8px" }}>{pageData.number + 1} / {pageData.totalPages || 1}</span>
              <button disabled={pageData.number + 1 >= pageData.totalPages} onClick={() => load(pageData.number + 1)}>다음</button>
            </div>
          </>
        )}
      </div>

      <div className="vehicle-register">
        <h3>차량 등록</h3>
        <div className="form-group">
          <label>차량번호 *</label>
          <input type="text" name="plateNumber" value={form.plateNumber} onChange={onChange} placeholder="12가3456" />
        </div>
        <div className="form-group">
          <label>차종 *</label>
          <select name="type" value={form.type} onChange={onChange}>
            <option value="">차종 선택</option>
            <option value="소형 트럭">소형 트럭</option>
            <option value="대형 트럭">대형 트럭</option>
            <option value="탑차">탑차</option>
            <option value="8t 트럭">8t 트럭</option>
          </select>
        </div>
        <div className="form-group">
          <label>모델</label>
          <input type="text" name="model" value={form.model} onChange={onChange} placeholder="e.g. Porter II" />
        </div>
        <div className="form-group">
          <label>적재 용량</label>
          <input type="number" name="capacity" value={form.capacity} onChange={onChange} placeholder="숫자(kg/ton 규칙 합의)" />
        </div>
        <div className="form-group" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" id="primary" name="primary" checked={form.primary} onChange={onChange} />
          <label htmlFor="primary">기본 차량으로 등록</label>
        </div>
        <button className="submit-btn" onClick={onSubmit}>등록</button>
      </div>

      {/* 간단 수정 모달 */}
      {editOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>차량 수정</h3>
            <div className="form-group">
              <label>차종</label>
              <input name="type" value={editForm.type} onChange={onEditChange} />
            </div>
            <div className="form-group">
              <label>모델</label>
              <input name="model" value={editForm.model} onChange={onEditChange} />
            </div>
            <div className="form-group">
              <label>적재 용량</label>
              <input type="number" name="capacity" value={editForm.capacity} onChange={onEditChange} />
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="submit-btn" onClick={onEditSubmit}>저장</button>
              <button className="edit-btn" onClick={() => setEditOpen(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleListRegister;