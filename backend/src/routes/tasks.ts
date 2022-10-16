import express from 'express';
import { getLogger } from '../utils/loggers';
const router = express.Router();
const logger = getLogger('USER_ROUTE');
import { db } from '../config/db';

/* GET tasks */
router.get('/', async function (_req, res, _next) {
  const { limit, offset } = _req.query;
  try {
    const tasks = await db.query(`
      SELECT id, title, description, userId, taskBoardId, index, completed
      FROM tasks LIMIT $1 OFFSET $2
      `, [ limit, offset ]);
    res.status(200).json(tasks.rows);
  } catch (err: any) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* POST task. */
router.post('/', async function (req, res, _next) {
  try {
    const { title, description, taskBoardId, userId, index, completed} = req.body;
    const task = await db.query(`
      INSERT INTO tasks (title, description, taskBoardId, userId, index, completed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title, description, userId, taskBoardId, index, completed
    `, [ title, description, taskBoardId, userId, index, completed ]);
    res.json(task.rows[0]);
  } catch (err: any) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* PATCH task. */
router.patch('/', async function (req, res, _next) {
  try {
    const { title, description, index, id } = req.body;
    const task = await db.query(`
      UPDATE tasks SET title = $1, description = $2, index = $3 WHERE id = $4 RETURNING id, title, description, index
    `, [ title, description, index, id ]);
    res.json(task.rows[0]);
  } catch (err: any) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* DELETE task. */
router.delete('/:id', async function (_req, res, _next) {
  const { id } = _req.params;
  try {
    await db.query(`
      DELETE FROM tasks WHERE id = $1
    `, [ id ]);

    res.status(200).json({ message: 'Task deleted' });
  } catch (err: any) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;