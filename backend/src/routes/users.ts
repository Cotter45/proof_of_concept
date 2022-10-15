import express from 'express';
import { getLogger } from '../utils/loggers';
const router = express.Router();
const logger = getLogger('USER_ROUTE');
import { db } from '../config/db';

/* GET users listing. */
router.get('/:id', async function (_req, res, _next) {
  const { id } = _req.params;
  try {
    const [ user, boards ] = await Promise.all([
      db.query(`
        SELECT id, username FROM users WHERE id = ${id}
      `),
      db.query(`
        SELECT id, title, userId, index, type FROM task_boards WHERE userId = ${id}
      `),
    ]);

    if (!user.rows.length) {
      return res.status(404).json({
        message: 'User not found',
      });
    }
    
    user.rows[0].boards = boards.rows || [];
    res.status(200).json(user.rows[0]);
  } catch (err: any) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* PATCH user. */
router.patch('/', async function (req, res, _next) {
  try {
    const { username, password } = req.body;
    const user = await db.query(`
      UPDATE users SET username = $1, password = $2 WHERE id = 1 RETURNING id, username
    `, [ username, password ]);
    res.json(user.rows[0]);
  } catch (err: any) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
