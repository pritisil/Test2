const Column = ({
  title,
  status,
  showAdd = false,
  onAdd,
  onDrop,
  showDelete = false,
  onDelete,
  children,
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const currentStatus = e.dataTransfer.getData("currentStatus");
    if (taskId && currentStatus !== status) {
      onDrop(taskId, status);
    }
  };

  return (
    <section className="column">
      <div className="column__header">
        <h2>{title}</h2>
        <div className="column__actions">
          {showAdd && (
            <button
              className="iconBtn"
              onClick={onAdd}
              aria-label={`Add in ${title}`}
            >
              +
            </button>
          )}
          {showDelete && (
            <button
              className="iconBtn delete-btn"
              onClick={onDelete}
              aria-label={`Delete ${title} column`}
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div
        className="column__body"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {children}
      </div>
    </section>
  );
};

export default Column;
