import { FormEvent, useEffect, useState } from "react";
import { TaskBoard, User } from "../../App";

export default function EditBoard({ board, setBoards, user, setEditBoards }: { board: TaskBoard; setBoards: any; user: User; setEditBoards: any }) {
  const [title, setTitle] = useState(board.title);
  const [type, setType] = useState(board.type);
  const [index, setIndex] = useState<string | number>(board.index);

  useEffect(() => {
    setIndex(board.index);
    setTitle(board.title);
    setType(board.type);
  }, [board]);

  const updateBoard = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:3000/boards`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        type,
        index,
        userId: user.id,
        id: board.id,
      }),
    });
    const updatedBoard = await response.json();
    setBoards((boards: TaskBoard[]) => {
      const newBoards = boards.map((board) => {
        if (+board.id === +updatedBoard.id) {
          return updatedBoard;
        }
        return board;
      });
      return newBoards;
    });
    setEditBoards(false);
  };

  const deleteBoard = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:3000/boards/${board.id}`, {
      method: "DELETE",
    });
    const deletedBoard = await response.json();
    setBoards((boards: TaskBoard[]) => {
      const newBoards = boards.filter((board) => +board.id !== +deletedBoard.id);
      return newBoards;
    });
    setEditBoards(false);
  };


  return (
    <form onSubmit={updateBoard} className="edit">
      <input
        autoFocus
        className="edit_input"
        type="text"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select
        className="edit_input"
        name="type"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="list">List</option>
        <option value="tags">Tag Icons</option>
        <option value="split">Incomplete / Complete</option>
      </select>
      <input
        className="edit_input"
        type="number"
        name="index"
        value={index}
        onChange={(e) => setIndex(e.target.value)}
      />
      <div className="edit_buttons">
        <button onClick={deleteBoard} className="edit_button" type="button">
          Delete
        </button>
        <button className="edit_button" type="submit">
          Save
        </button>
      </div>
    </form>
  );
};