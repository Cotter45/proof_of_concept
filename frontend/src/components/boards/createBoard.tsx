import { FormEvent, useState } from "react";
import { TaskBoard, User } from "../../App";

export default function CreateBoard({ setBoards, user, setEditBoards, length }: { setBoards: any; user: User; setEditBoards: any; length: number }) {
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<string>('');

  const createBoard = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch(`http://localhost:3000/boards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        type: type || 'list',
        index: length + 1,
        userId: user.id,
      }),
    });
    const newBoard = await response.json();
    setBoards((boards: TaskBoard[]) => {
      const newBoards = [...boards, newBoard];
      return newBoards;
    });
    setEditBoards(false);
  };
  
  return (
    <form onSubmit={createBoard} className="edit">
      <h2>New Board</h2>
      <input
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
      <button className="edit_button" type="submit">
        Save
      </button>
    </form>
  );
}