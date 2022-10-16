import express from 'express';
import { getLogger } from '../utils/loggers';
const router = express.Router();
const logger = getLogger('USER_ROUTE');
import { db } from '../config/db';

/* GET board. */
router.get('/:id', async function (_req, res, _next) {
  const { id } = _req.params;
  try {
    const board = await db.query(`
      SELECT id, title, userId, index, type, (
        SELECT json_agg(tasks) AS tasks FROM (
          SELECT id, title, description, userId, taskBoardId, index, completed
          FROM tasks WHERE taskBoardId = $1
        ) tasks
      )
      FROM task_boards WHERE id = $1
    `, [ id ]);

    res.status(200).json(board.rows[0]);
  } catch (err: any) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* POST board. */
router.post('/', async function (req, res, _next) {
  try {
    const { title, userId, index, type } = req.body;
    const board = await db.query(`
      INSERT INTO task_boards (title, userId, index, type) VALUES ($1, $2, $3, $4) RETURNING id, title, userId, index, type
    `, [ title, userId, index, type ]);
    res.json(board.rows[0]);
  } catch (err: any) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});
    

/* PATCH board. */
router.patch('/', async function (req, res, _next) {
  try {
    const { title, index, id, userId, type } = req.body;
    const board = await db.query(`
      UPDATE task_boards SET title = $1, index = $2, userId = $3, type = $4 WHERE id = $5 RETURNING id, title, userId, index, type
    `, [ title, index, userId, type, id ]);
    res.json(board.rows[0]);
  } catch (err: any) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* DELETE board. */
router.delete('/:id', async function (_req, res, _next) {
  const { id } = _req.params;
  try {
    await db.query(`
      DELETE FROM task_boards WHERE id = $1 RETURNING id
    `, [ id ]);

    res.status(200).json({ id: id });
  } catch (err: any) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

