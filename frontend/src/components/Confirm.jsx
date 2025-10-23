// src/components/Confirm.jsx
import React from "react";

export default function Confirm({ message = "Are you sure?", onConfirm, onCancel }) {
  return (
    <div className="confirm">
      <div className="confirm-box">
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn danger" onClick={onConfirm}>Yes</button>
          <button className="btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
