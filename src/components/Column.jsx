// import React from "react";
// import { Droppable } from "react-beautiful-dnd";

// export default function Column({ title, status, showAdd = false, onAdd, children }) {
//   return (
//     <section className="column">
//       <div className="column__header">
//         <h2>{title}</h2>
//         {showAdd && (
//           <button
//             className="iconBtn"
//             onClick={onAdd}
//             aria-label={`Add in ${title}`}
//           >
//             +
//           </button>
//         )}
//       </div>
//       <Droppable droppableId={status}>
//         {(provided) => (
//           <div
//             className="column__body"
//             ref={provided.innerRef}
//             {...provided.droppableProps}
//           >
//             {children}
//             {provided.placeholder}
//           </div>
//         )}
//       </Droppable>
//     </section>
//   );
// }


import { Droppable } from "react-beautiful-dnd";
import { STATUSES } from "../constants.js";

export default function Column({ title, status, children, showAdd, onAdd }) {
  return (
    <div className="column">
      <h2 className="column__title">{title}</h2>

      {/* Show + button only if showAdd is true */}
      {showAdd && (
        <button className="add-btn" onClick={onAdd}>
          +
        </button>
      )}

      <Droppable 
  droppableId={status} 
  isDropDisabled={status === STATUSES.DONE}  // 👈 important
>
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
    </div>
  );
}
