const DeleteTaskModal = ({ onClose, onSubmit, value, onChange, error }) => {
  return (
    <div className="modal__backdrop">
      <div className="modal">
        <div className="modal__header">
          <h3>Confirm Delete</h3>
          <button className="iconBtn" onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="modal__form">
          <label className="label">
            Type delete to confirm
            <input
              className="input"
              placeholder="Type here..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </label>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="btn danger">
            Delete
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeleteTaskModal;
