import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";
import Column from "./components/Column";
import TaskList from "./components/TaskList";
import AddTaskModal from "./components/AddTaskModal";
import DeleteTaskModal from "./components/DeleteTaskModal";

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
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // ✅ Handle drop (update status in DB)
  const handleDrop = async (taskId, newStatus) => {
    try {
      const res = await axios.put(`${API_URL}/${taskId}`, {
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
        <Column
          key={STATUSES.TODO}
          title="Todo"
          status={STATUSES.TODO}
          showAdd
          onAdd={() => openAddModal(STATUSES.TODO)}
          onDrop={handleDrop}
        >
          <TaskList
            items={tasksByStatus(STATUSES.TODO)}
            onDelete={openDeleteModal}
            onEdit={handleEdit}
          />
        </Column>

        <Column
          key={STATUSES.INPROGRESS}
          title="In Progress"
          status={STATUSES.INPROGRESS}
          showAdd
          onAdd={() => openAddModal(STATUSES.INPROGRESS)}
          onDrop={handleDrop}
        >
          <TaskList
            items={tasksByStatus(STATUSES.INPROGRESS)}
            onDelete={openDeleteModal}
            onEdit={handleEdit}
          />
        </Column>

        <Column
          key={STATUSES.DONE}
          title="Done"
          status={STATUSES.DONE}
          onDrop={handleDrop}
        >
          <TaskList
            items={tasksByStatus(STATUSES.DONE)}
            onDelete={openDeleteModal}
            onEdit={handleEdit}
          />
        </Column>
      </main>

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
