import React from 'react';

const Task = ({ task, provided }) => {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="task-item"
    >
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <p>Due: {task.dueDate}</p>
      
    </div>
  );
};

export default Task;
