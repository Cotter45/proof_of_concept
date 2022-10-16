import { FormEvent, useEffect, useRef, useState } from "react";
import type { Task, TaskBoard, User } from "../../App";

export default function List({ board, user }: { board: TaskBoard; user: User }) {
  const dragItem = useRef();
  const dragOverItem = useRef();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [openTask, setOpenTask] = useState(0);
  const [dragTask, setDragTask] = useState<Task>();
  const [dragOverTask, setDragOverTask] = useState<Task>();
  const [editTasks, setEditTasks] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    (async () => {
      const response = await fetch(`http://localhost:3000/boards/${board.id}`);
      const boardWithTasks = await response.json();
      setTasks(boardWithTasks.tasks || []);
    })();
  }, []);

  const dragStart = (e: any, position: any) => {
    if (!editTasks) return;
    const task = tasks.find((task: Task) => task.index === position);
    setDragTask(task);
    dragItem.current = position;
    console.log(task);
  };

  const dragEnter = (e: any, position: any) => {
    if (!editTasks) return;
    dragOverItem.current = position;
    const task = tasks.find((task: Task) => task.index === position);
    setDragOverTask(task);
  };

  const drop = (e: any) => {
    if (!editTasks) return;
    if (!dragTask || !dragOverTask) return;
    const newtasks = tasks.map((task: Task) => {
      if (task.index === dragOverTask.index) {
        return { ...task, index: dragTask.index };
      }
      if (task.index === dragTask.index) {
        return { ...task, index: dragOverTask.index };
      }
      return task;
    });
    setTasks(newtasks);
    setDragTask(undefined);
    setDragOverTask(undefined);
  };

  const createTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    const response = await fetch("http://localhost:3000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        userId: user.id,
        taskBoardId: board.id,
        index: tasks.length + 1,
        completed: false,
      }),
    });
    const task = await response.json();
    setTasks([...tasks, task]);
    setTitle("");
    setDescription("");
    setEditTasks(false);
  };

  return (
    <div className="board">
      <div className="board-header">
        <h3>{board.title}</h3>
        <button onClick={() => setEditTasks(!editTasks)} className="add-task">
          {editTasks ? "Cancel" : "Edit"}
        </button>
      </div>
      {editTasks && (
        <form className="edit" onSubmit={createTask}>
          <input
            autoFocus
            type="text"
            placeholder="Title"
            className="edit_input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            className="edit_input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="edit_buttons">
            <button type="submit">Save</button>
          </div>
        </form>
      )}
      {tasks
        .sort((a: Task, b: Task) => a.index - b.index)
        .map((task: Task) => (
          <div
            className="task"
            key={task.id}
            onClick={() => {
              if (openTask === task.id) {
                setOpenTask(0);
              } else {
                setOpenTask(task.id);
              }
            }}
            draggable
            onDragStart={(e) => dragStart(e, task.index)}
            onDragEnter={(e) => dragEnter(e, task.index)}
            onDragEnd={drop}
            style={{
              backgroundColor: dragOverTask?.id === task.id ? "gray" : "",
              opacity: dragTask?.id === task.id ? 0.25 : 1,
            }}
          >
            <div className="task-title">{task.title}</div>
            {openTask === task.id && (
              <div className="task-description">{task.description}</div>
            )}
          </div>
        ))}
    </div>
  );
};