import { forwardRef } from "react";

const CalendarInput = forwardRef(({ value, onClick }, ref) => {
  const isSelected = value && value.trim() !== "";

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        marginTop: "0.4rem",
        alignItems: "center",
        border: "1px solid #ccc",
        borderRadius: "6px",
        backgroundColor: isSelected ? "#ffffff" : "#f5f5f5",
        padding: "0.5rem 0.75rem",
        boxSizing: "border-box",
      }}
    >
      <img
        src={`${process.env.PUBLIC_URL}/img/orderimg/calendar_navy.png`}
        alt="달력 아이콘"
        onClick={onClick}
        style={{
          width: "20px",
          height: "20px",
          marginRight: "10px",
          cursor: "pointer",
          opacity: 0.85,
          flexShrink: 0,
        }}
      />

      <input
        type="text"
        readOnly
        ref={ref}
        value={value}
        onClick={onClick}
        placeholder="날짜 선택"
        style={{
          width: "100%",
          border: "none",
          backgroundColor: "transparent",
          fontSize: "15px",
          outline: "none",
          cursor: "pointer",
          color: isSelected ? "#000000" : "#999999",
        }}
      />
    </div>
  );
});

export default CalendarInput;
