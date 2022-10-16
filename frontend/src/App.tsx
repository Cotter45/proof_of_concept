import { useEffect, useRef, useState } from 'react'
import './App.css'
import CreateBoard from './components/boards/createBoard';
import EditBoard from './components/boards/editBoard';
import List from './components/boards/list';
import Split from './components/boards/split';
import Tags from './components/boards/tags';

export type User = {
  id: number;
  username: string;
};

export type TaskBoard = {
  id: number;
  title: string;
  userId: number;
  index: number;
  type: string;
};

export type Task = {
  id: number;
  title: string;
  description: string;
  userId: number;
  taskBoardId: number;
  index: number;
  completed: boolean;
};

function App() {
  const dragItem = useRef();
  const dragOverItem = useRef();

  const [user, setUser] = useState<User>();
  const [boards, setBoards] = useState<TaskBoard[]>([]);
  const [dragBoard, setDragBoard] = useState<TaskBoard>();
  const [dragOverBoard, setDragOverBoard] = useState<TaskBoard>();
  const [editBoards, setEditBoards] = useState(false);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    (async () => {
      const response = await fetch('http://localhost:3000/users/1');
      const user = await response.json();
      setUser(user);
      setBoards(user.boards);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const response = await fetch(`http://localhost:3000/tasks?limit=${limit}&offset=${offset}`);
      const tasks = await response.json();
      setAllTasks(tasks);
    })();
  }, [limit]);

  const dragStart = (e: any, position: any) => {
    if (!editBoards) return;
    const board = boards.find((board) => board.index === position);
    setDragBoard(board);
    dragItem.current = position;
  };

  const dragEnter = (e: any, position: any) => {
    if (!editBoards) return;
    dragOverItem.current = position;
    const board = boards.find((board) => board.index === position);
    setDragOverBoard(board);
  };

  const drop = (e: any) => {
    if (!editBoards) return;
    if (!dragBoard || !dragOverBoard) return;
    const newBoards = boards.map((board) => {
      if (board.index === dragOverBoard.index) {
        return { ...board, index: dragBoard.index };
      }
      if (board.index === dragBoard.index) {
        return { ...board, index: dragOverBoard.index };
      }
      return board;
    });
    setBoards(newBoards);
    setDragBoard(undefined);
    setDragOverBoard(undefined);
    fetch('http://localhost:3000/boards', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...dragBoard,
        userId: user?.id,
        index: dragOverBoard.index,
      }),
    });
    fetch('http://localhost:3000/boards', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...dragOverBoard,
        userId: user?.id,
        index: dragBoard.index,
      }),
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>{user?.username}</h2>
        <button onClick={() => setEditBoards(!editBoards)}>{editBoards ? 'Cancel' : 'Edit'}</button>
      </header>
      <div className="boards">
        {editBoards && user && boards && (
          <div className="container">
            <CreateBoard user={user} setBoards={setBoards} setEditBoards={setEditBoards} length={boards.length} />
          </div>
        )}
        {user && boards.sort((a, b) => a.index - b.index).map((board) => (
          <div
            key={board.id}
            className="container"
            draggable
            onDragStart={(e) => dragStart(e, board.index)}
            onDragEnter={(e) => dragEnter(e, board.index)}
            onDragEnd={drop}
            style={{ backgroundColor: dragOverBoard?.id === board.id ? 'gray' : '', opacity: dragBoard?.id === board.id ? 0.25 : 1, cursor: editBoards ? 'grab' : 'default' }}
          >
            {editBoards && <EditBoard board={board} setBoards={setBoards} user={user} setEditBoards={setEditBoards} />}
            {!editBoards && user &&
              {
                split: <Split board={board} user={user} />,
                tags: <Tags board={board} user={user} />,
                list: <List board={board} user={user} />,
                "": <List board={board} user={user} />,
              }[board.type]
            }
          </div>
        ))}
      </div>
      {allTasks.map((task) => (
        <div style={{
          width: '80%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #fff',
          margin: '0 auto',
        }} key={task.id}>
          <h3>{task.id}. {task.title}</h3>
          <p>{task.description}</p>
        </div>
      ))}
      <button style={{ marginTop: '2rem'}} onClick={() => setLimit(limit + 10)}>Load More</button>
    </div>
  );
}

export default App
