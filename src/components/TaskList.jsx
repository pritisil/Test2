import React from "react";
import TaskItem from "./TaskItem";

const TaskList = ({ items, onDelete, onEdit }) => {
  return (
    <ul className="tasklist">
      {items.length === 0 ? (
        <div className="empty">No tasks yet</div>
      ) : (
        items.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))
      )}
    </ul>
  );
};

export default TaskList;
