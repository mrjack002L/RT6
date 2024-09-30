import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Task from "./Task";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import "./ToDoList.css";

function ToDoList() {
  const [todoListName, setTodoListName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskPriority, setTaskPriority] = useState("Low");
  const [toDoLists, setToDoLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);

  const priorityOptions = ["Low", "Medium", "High"];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchToDoLists(user.uid);
      } else {
        setToDoLists([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchToDoLists = async (userId) => {
    try {
      const q = query(collection(db, "ToDoLists"), where("owner", "==", userId));
      const querySnapshot = await getDocs(q);
      const lists = [];
      querySnapshot.forEach((doc) => {
        lists.push({ id: doc.id, ...doc.data() });
      });
      setToDoLists(lists);
    } catch (error) {
      console.error("Error fetching to-do lists: ", error);
      toast.error("Error fetching To-Do Lists: " + error.message);
    }
  };

  const handleCreateToDoList = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("Please log in to create a list.");
      return;
    }
    try {
      await addDoc(collection(db, "ToDoLists"), {
        name: todoListName,
        owner: currentUser.uid,
        tasks: [],
      });
      toast.success("To-Do List created successfully!");
      setTodoListName("");
      fetchToDoLists(currentUser.uid);
    } catch (error) {
      console.error("Error creating to-do list: ", error);
      toast.error(error.message);
    }
  };

  const handleAddTask = async () => {
    if (!taskTitle || !taskDescription || !taskDueDate || !taskPriority) {
      toast.error("Please fill in all task details.");
      return;
    }
    if (!selectedListId) {
      toast.error("Please select a list to add the task.");
      return;
    }
    const task = {
      id: uuidv4(),
      title: taskTitle,
      description: taskDescription,
      dueDate: taskDueDate,
      priority: taskPriority,
    };
    try {
      const listRef = doc(db, "ToDoLists", selectedListId);
      await updateDoc(listRef, {
        tasks: arrayUnion(task),
      });
      toast.success("Task added successfully!");
      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate("");
      setTaskPriority("Low");
      fetchToDoLists(auth.currentUser.uid);
    } catch (error) {
      console.error("Error adding task: ", error);
      toast.error(error.message);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceList = toDoLists.find(list => list.id === source.droppableId.split('-')[0]);
    const destList = toDoLists.find(list => list.id === destination.droppableId.split('-')[0]);

    if (!sourceList || !destList) return;

    const sourceTasks = Array.from(sourceList.tasks);
    const destTasks = sourceList === destList ? sourceTasks : Array.from(destList.tasks);

    const [movedTask] = sourceTasks.splice(source.index, 1);
    movedTask.priority = destination.droppableId.split('-')[1];
    destTasks.splice(destination.index, 0, movedTask);

    const updatedLists = toDoLists.map(list => {
      if (list.id === sourceList.id) {
        return { ...list, tasks: sourceTasks };
      }
      if (list.id === destList.id) {
        return { ...list, tasks: destTasks };
      }
      return list;
    });

    setToDoLists(updatedLists);

    try {
      await Promise.all([
        updateDoc(doc(db, "ToDoLists", sourceList.id), { tasks: sourceTasks }),
        updateDoc(doc(db, "ToDoLists", destList.id), { tasks: destTasks })
      ]);
      toast.success("Task moved successfully!");
    } catch (error) {
      console.error("Error updating lists in Firestore: ", error);
      toast.error("Error moving task: " + error.message);
    }
  };

  return (
    <div className="todo-container">
      <h4 className="todo-title">Create New To-Do List</h4>
      <input
        type="text"
        className="input-field"
        value={todoListName}
        onChange={(e) => setTodoListName(e.target.value)}
        placeholder="Enter To-Do List Name"
      />
      <button className="create-btn" onClick={handleCreateToDoList}>
        Create List
      </button>

      <h5>Select a List to Add Task</h5>
      <select
        className="input-field"
        value={selectedListId || ""}
        onChange={(e) => setSelectedListId(e.target.value)}
      >
        <option value="">Select List</option>
        {toDoLists.map((list) => (
          <option key={list.id} value={list.id}>
            {list.name}
          </option>
        ))}
      </select>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="lists-container">
          {toDoLists.map((list) => (
            <div key={list.id} className="list-column">
              <h5 className="list-title">{list.name}</h5>
              {priorityOptions.map((priority) => (
                <Droppable key={`${list.id}-${priority}`} droppableId={`${list.id}-${priority}`}>
                  {(provided) => (
                    <div
                      className="priority-section"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{ overflowY: "auto", maxHeight: "300px" }}
                    >
                      <h6 className="priority-title">{priority} Priority</h6>
                      {list.tasks
                        .filter((task) => task.priority === priority)
                        .map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <Task
                                task={task}
                                provided={provided}
                                ref={provided.innerRef}
                              />
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          ))}
        </div>
      </DragDropContext>

      <div className="task-form">
        <h5>Add Task</h5>
        <input
          type="text"
          className="input-field"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Enter Task Title"
        />
        <input
          type="text"
          className="input-field"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="Enter Task Description"
        />
        <input
          type="date"
          className="input-field"
          value={taskDueDate}
          onChange={(e) => setTaskDueDate(e.target.value)}
        />
        <select
          className="input-field"
          value={taskPriority}
          onChange={(e) => setTaskPriority(e.target.value)}
        >
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <button className="add-task-btn" onClick={handleAddTask}>
          Add Task
        </button>
      </div>
    </div>
  );
}

export default ToDoList;
