import React from "react";
import { Draggable } from "react-beautiful-dnd";
import TaskItem from "./TaskItem";

export default function TaskList({ items, onDelete, onEdit }) {
  if (items.length === 0) {
    return <div className="empty">No tasks yet</div>;
  }

  return (
    <ul className="tasklist">
      {items.map((task, index) => (
        <Draggable
          draggableId={task._id.toString()}
          index={index}
          key={task._id}
        >
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
