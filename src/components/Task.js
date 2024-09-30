import React from "react";

const Task = React.forwardRef(({ task, provided }, ref) => {
  return (
    <div
      ref={ref}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="task"
    >
      <h5>{task.title}</h5>
      <p>{task.description}</p>
      <p>Due Date: {task.dueDate}</p>
    </div>
  );
});

export default Task;
