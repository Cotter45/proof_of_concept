const { Pool } = require('pg')
// const client = new Pool('postgresql://postgres:postgres@localhost:8080?schema=public')
const db = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 8080,
})

db.on('error', (err: any, client: any) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

async function seedData(client: any) {
  try {
    const users = await client.query(`
      SELECT * FROM users
    `);
  
    if (!users.rows.length) {
      await client.query(`
        DROP TABLE IF EXISTS tasks;
        DROP TABLE IF EXISTS task_boards;
        DROP TABLE IF EXISTS users;
  
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE task_boards (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          userId INTEGER NOT NULL,
          type VARCHAR(255) NOT NULL,
          index INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
        );
  
        CREATE TABLE tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          userId INTEGER NOT NULL,
          taskBoardId INTEGER NOT NULL,
          index INTEGER NOT NULL,
          completed BOOLEAN NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (taskBoardId) REFERENCES task_boards(id) ON DELETE CASCADE ON UPDATE CASCADE
        );
  
        INSERT INTO users (username, password) VALUES ('admin', 'admin');

        INSERT INTO task_boards (title, userId, index, type) VALUES ('Type 1', 1, 0, 'list');
        INSERT INTO task_boards (title, userId, index, type) VALUES ('Type 2', 1, 1, 'tags');
        INSERT INTO task_boards (title, userId, index, type) VALUES ('Type 3', 1, 2, 'split');
    
        INSERT INTO tasks (title, description, userId, taskBoardId, index, completed) VALUES ('Task 1', 'Description 1', 1, 1, 1, false);
        INSERT INTO tasks (title, description, userId, taskBoardId, index, completed) VALUES ('Task 2', 'Description 2', 1, 1, 2, false);
        INSERT INTO tasks (title, description, userId, taskBoardId, index, completed) VALUES ('Task 3', 'Description 3', 1, 1, 3, false);
        INSERT INTO tasks (title, description, userId, taskBoardId, index, completed) VALUES ('Task 4', 'Description 4', 1, 1, 4, false);
        INSERT INTO tasks (title, description, userId, taskBoardId, index, completed) VALUES ('Task 5', 'Description 5', 1, 1, 5, false);

        CREATE INDEX task_board_id ON tasks (taskBoardId);
      `)
    }
  } catch (error) {
    console.log(error);
  } finally {
    await client.release()
  }
}

export { db, seedData };

