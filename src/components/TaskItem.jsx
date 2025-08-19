import { useEffect, useRef, useState } from "react";

const TaskItem = ({ task, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const save = () => {
    const val = draft.trim();
    if (val && val !== task.title) onEdit(task._id, val);
    setIsEditing(false);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData("taskId", task._id);
    e.dataTransfer.setData("currentStatus", task.status);
  };

  return (
    <li
      className="task"
      draggable={task.status !== "done"}
      onDragStart={handleDragStart}
      style={{ opacity: task.status === "done" ? 0.6 : 1 }}
    >
      {!isEditing ? (
        <>
          <span className="task__title">{task.title}</span>
          <div className="task__actions">
            <button
              className="iconBtn"
              title="Edit"
              onClick={() => setIsEditing(true)}
              aria-label="Edit task"
            >
              ✏️
            </button>
            <button
              className="iconBtn danger"
              title="Delete"
              onClick={() => onDelete(task._id)}
              aria-label="Delete task"
            >
              🗑️
            </button>
          </div>
        </>
      ) : (
        <form
          className="task__edit"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input
            ref={inputRef}
            className="input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsEditing(false);
            }}
            aria-label="Edit task title"
          />
          <div className="edit__actions">
            <button type="submit" className="btn">
              Save
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </li>
  );
};

export default TaskItem;
