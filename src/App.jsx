import { useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

const STATUSES = {
  TODO: "todo",
  INPROGRESS: "inprogress",
  DONE: "done",
};

export default function App() {
  const [tasks, setTasks] = useState([]);

  // Add Task Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForStatus, setModalForStatus] = useState(STATUSES.TODO);
  const [modalTitle, setModalTitle] = useState("");

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // ✅ Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(API_URL);
        setTasks(res.data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };
    fetchTasks();
  }, []);

  // Open Add Task Modal
  const openAddModal = (status) => {
    setModalForStatus(status);
    setModalTitle("");
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  // ✅ Add new task to backend
  const handleAddTask = async (e) => {
    e.preventDefault();
    const title = modalTitle.trim();
    if (!title) return;
    try {
      const res = await axios.post(API_URL, {
        title,
        status: modalForStatus,
      });
      setTasks((prev) => [res.data, ...prev]);
      closeModal();
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
    setDeleteInput("");
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  // ✅ Confirm Delete
  const confirmDelete = async (e) => {
    e.preventDefault();
    if (deleteInput.trim().toLowerCase() === "delete") {
      try {
        await axios.delete(`${API_URL}/${deleteTargetId}`);
        setTasks((prev) => prev.filter((t) => t._id !== deleteTargetId));
        setDeleteModalOpen(false);
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    } else {
      setDeleteError("Invalid");
    }
  };

  // ✅ Edit task (update title)
  const handleEdit = async (id, newTitle) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { title: newTitle });
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? res.data : t))
      );
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // ✅ Drag and drop handler (update status in DB)
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    if (sourceStatus === STATUSES.DONE && destStatus !== STATUSES.DONE) return;

    if (
      (sourceStatus === STATUSES.TODO && destStatus === STATUSES.INPROGRESS) ||
      (sourceStatus === STATUSES.INPROGRESS && destStatus === STATUSES.TODO) ||
      (destStatus === STATUSES.DONE && sourceStatus !== STATUSES.DONE) ||
      (sourceStatus === destStatus)
    ) {
      try {
        const res = await axios.put(`${API_URL}/${draggableId}`, {
          status: destStatus,
        });
        setTasks((prev) =>
          prev.map((t) => (t._id === draggableId ? res.data : t))
        );
      } catch (err) {
        console.error("Error updating task status:", err);
      }
    }
  };

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <div className="app">
      <header className="app__header">
        <h1>TO DO APP</h1>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <main className="board">
          <Column
            title="Todo"
            status={STATUSES.TODO}
            showAdd
            onAdd={() => openAddModal(STATUSES.TODO)}
          >
            <TaskList
              items={tasksByStatus(STATUSES.TODO)}
              onDelete={openDeleteModal}
              onEdit={handleEdit}
            />
          </Column>

          <Column
            title="In Progress"
            status={STATUSES.INPROGRESS}
            showAdd
            onAdd={() => openAddModal(STATUSES.INPROGRESS)}
          >
            <TaskList
              items={tasksByStatus(STATUSES.INPROGRESS)}
              onDelete={openDeleteModal}
              onEdit={handleEdit}
            />
          </Column>

          <Column title="Done" status={STATUSES.DONE}>
            <TaskList
              items={tasksByStatus(STATUSES.DONE)}
              onDelete={openDeleteModal}
              onEdit={handleEdit}
            />
          </Column>
        </main>
      </DragDropContext>

      {/* Add Task Modal */}
      {isModalOpen && (
        <AddTaskModal
          title={
            modalForStatus === STATUSES.TODO ? "Add Todo" : "Add In Progress"
          }
          value={modalTitle}
          onChange={setModalTitle}
          onClose={closeModal}
          onSubmit={handleAddTask}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <DeleteTaskModal
          onClose={() => setDeleteModalOpen(false)}
          onSubmit={confirmDelete}
          value={deleteInput}
          onChange={setDeleteInput}
          error={deleteError}
        />
      )}
    </div>
  );
}

/* ======== keep your Column, TaskList, TaskItem, AddTaskModal, DeleteTaskModal same ======== */


/* ====================== Components ====================== */

function Column({ title, status, showAdd = false, onAdd, children }) {
  return (
    <section className="column">
      <div className="column__header">
        <h2>{title}</h2>
        {showAdd && (
          <button
            className="iconBtn"
            onClick={onAdd}
            aria-label={`Add in ${title}`}
          >
            +
          </button>
        )}
      </div>
      <Droppable droppableId={status}>
        {(provided) => (
          <div
            className="column__body"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </section>
  );
}

function TaskList({ items, onDelete, onEdit }) {
  if (items.length === 0) {
    return <div className="empty">No tasks yet</div>;
  }
  return (
    <ul className="tasklist">
      {items.map((task, index) => (
        <Draggable draggableId={task.id.toString()} index={index} key={task.id}>
          {(provided) => (
            <li
              className="task"
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <TaskItem task={task} onDelete={onDelete} onEdit={onEdit} />
            </li>
          )}
        </Draggable>
      ))}
    </ul>
  );
}

function TaskItem({ task, onDelete, onEdit }) {
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
    if (val && val !== task.title) onEdit(task.id, val);
    setIsEditing(false);
  };

  return !isEditing ? (
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
          onClick={() => onDelete(task.id)}
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
  );
}

function AddTaskModal({ title, value, onChange, onClose, onSubmit }) {
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
          <button type="submit" className="btn primary" disabled={!value.trim()}>
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
}

function DeleteTaskModal({ onClose, onSubmit, value, onChange, error }) {
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
}
