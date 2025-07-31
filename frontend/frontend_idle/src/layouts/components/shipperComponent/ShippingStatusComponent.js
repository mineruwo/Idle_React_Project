import React from "react";
import "../../../theme/ShipperCustomCss/ShipperStatus.css";

const steps = ["화주(오더신청)", "차주 연결", "운송중", "완료"];

const ShipperStatusComponent = ({ currentStep = 0 }) => {
    return (
        <div className="delivery-process-container">
            {steps.map((label, idx) => (
                <React.Fragment key={idx}>
                    <div
                        className={`process-step${
                            idx <= currentStep ? " active" : ""
                        }`}
                    >
                        <div className="process-label">{label}</div>
                    </div>
                    {idx < steps.length - 1 && (
                        <div className="process-arrow">→</div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default ShipperStatusComponent;
