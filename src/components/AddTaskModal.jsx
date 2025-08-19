import React, { useEffect, useRef, useState } from "react";

const AddTaskModal = ({ title, value, onChange, onClose, onSubmit }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal__backdrop">
      <div className="modal">
        <div className="modal__header">
          <h3>{title}</h3>
          <button className="iconBtn" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="modal__form">
          <label className="label">
            Task title
            <input
              ref={inputRef}
              className="input"
              placeholder="Type task…"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </label>
          <button
            type="submit"
            className="btn primary"
            disabled={!value.trim()}
          >
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
