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

  useEffect(() => {
    (async () => {
      const response = await fetch('http://localhost:3000/users/1');
      const user = await response.json();
      setUser(user);
      setBoards(user.boards);
    })();
  }, []);

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

  const drop = async (e: any) => {
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
    await fetch('http://localhost:3000/boards', {
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
    await fetch('http://localhost:3000/boards', {
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
    </div>
  );
}

export default App
