import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";
import Column from "./components/Column";
import TaskList from "./components/TaskList";
import AddTaskModal from "./components/AddTaskModal";
import DeleteTaskModal from "./components/DeleteTaskModal";

const API_URL = "http://localhost:5000/api";

const FIXED_COLUMNS = ["todo", "inprogress", "done"];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [newColumnName, setNewColumnName] = useState("");
  const [showAddColumn, setShowAddColumn] = useState(false);

  // Add Task Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalForStatus, setModalForStatus] = useState("todo");
  const [modalTitle, setModalTitle] = useState("");

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // ✅ Fetch tasks and columns from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/tasks`);
        setTasks(res.data.tasks);
        setColumns(res.data.columns.map(col => ({
          id: col.name,
          title: col.displayName,
          isFixed: col.isDefault,
          color: col.color,
          _id: col._id
        })));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // Open Add Task Modal
  const openAddModal = (status) => {
    setModalForStatus(status);
    setModalTitle("");
    setIsModalOpen(true);
  };

  // Add new column
  const handleAddColumn = async () => {
    const name = newColumnName.trim();
    if (!name) return;
    
    try {
      await axios.post(`${API_URL}/columns`, {
        displayName: name,
        color: "#6b7280"
      });
      
      // Refresh columns to get correct order
      const res = await axios.get(`${API_URL}/tasks`);
      setColumns(res.data.columns.map(col => ({
        id: col.name,
        title: col.displayName,
        isFixed: col.isDefault,
        color: col.color,
        _id: col._id
      })));
      
      setNewColumnName("");
      setShowAddColumn(false);
    } catch (err) {
      console.error("Error adding column:", err);
    }
  };

  // Delete column
  const handleDeleteColumn = async (columnId) => {
    if (FIXED_COLUMNS.includes(columnId)) return;
    
    const column = columns.find(col => col.id === columnId);
    if (!column) return;
    
    try {
      await axios.delete(`${API_URL}/columns/${column._id}`);
      setColumns(prev => prev.filter(col => col.id !== columnId));
      setTasks(prev => prev.filter(task => task.status !== columnId));
    } catch (err) {
      console.error("Error deleting column:", err);
    }
  };
  const closeModal = () => setIsModalOpen(false);

  // ✅ Add new task to backend
  const handleAddTask = async (e) => {
    e.preventDefault();
    const title = modalTitle.trim();
    if (!title) return;
    try {
      const res = await axios.post(`${API_URL}/tasks`, {
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
        await axios.delete(`${API_URL}/tasks/${deleteTargetId}`);
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
      const res = await axios.put(`${API_URL}/tasks/${id}`, { title: newTitle });
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // ✅ Handle drop (update status in DB)
  const handleDrop = async (taskId, newStatus) => {
    try {
      const res = await axios.put(`${API_URL}/tasks/${taskId}`, {
        status: newStatus,
      });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data : t)));
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <div className="app">
      <header className="app__header">
        <h1>TO DO APP</h1>
      </header>

      <main className="board">
        {columns.map((column) => (
          <Column
            key={column.id}
            title={column.title}
            status={column.id}
            showAdd={column.id !== "done"}
            onAdd={() => openAddModal(column.id)}
            onDrop={handleDrop}
            showDelete={!column.isFixed}
            onDelete={() => handleDeleteColumn(column.id)}
          >
            <TaskList
              items={tasksByStatus(column.id)}
              onDelete={openDeleteModal}
              onEdit={handleEdit}
            />
          </Column>
        ))}
        
        <div className="add-column">
          {!showAddColumn ? (
            <button 
              className="add-column-btn"
              onClick={() => setShowAddColumn(true)}
            >
              + Add Column
            </button>
          ) : (
            <div className="add-column-form">
              <input
                className="input"
                type="text"
                placeholder="Enter column name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
                autoFocus
              />
              <div className="add-column-actions">
                <button onClick={handleAddColumn}>Add</button>
                <button onClick={() => { setShowAddColumn(false); setNewColumnName(""); }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Task Modal */}
      {isModalOpen && (
        <AddTaskModal
          title={`Add ${columns.find(col => col.id === modalForStatus)?.title || 'Task'}`}
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
