import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

const express = require('express');
const { pool } = require('../db');

const getQuery = require('../utils');

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

	try {
    const { userId }  = req.user;

    const query = getQuery('../db/tasks/get_tasks.sql');
		const result = await pool.query(query, [userId]);	
  
    res.status(200).send(result.rows)
	} catch (err: unknown) {
      if(err instanceof Error) {
        console.error("Server Error: " + err.message);
      } else {
        console.error("An unknown error occurred:", err);
      }

    return res.status(500).send('Server Error'); 
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, created_at, deadline_date, status, priority, color } = req.body;
    const { userId } = req.user;
    const id = randomUUID();

    const query = getQuery('../db/tasks/insert_task.sql');
    const result = await pool.query(query, [id, title, description, created_at, deadline_date, status, priority, color, userId]);

    return res.status(201).json(result.rows[0]); 
  } catch (err: unknown) {
      if(err instanceof Error) {
        console.error("Server Error: " + err.message);
      } else {
        console.error("An unknown error occurred:", err);
      }

    return res.status(500).send('Server Error'); 
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = getQuery('../db/tasks/get_task.sql');
    const result = await pool.query(query, [id]);	

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(result.rows[0]); 
  } catch (err: unknown) {
      if(err instanceof Error) {
        console.error("Server Error: " + err.message);
      } else {
        console.error("An unknown error occurred:", err);
      }

    return res.status(500).send('Server Error'); 
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try{
    const { id } = req.params;
    const { userId } = req.user;
    const { title, description, deadline_date, status, priority, color } = req.body;

    const query = getQuery('../db/tasks/update_task.sql');    
    const result = await pool.query(query, [title, description, deadline_date, status, priority, color, id, userId]);	

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(result.rows[0]);

  } catch (err: unknown) {
      if(err instanceof Error) {
        console.error("Server Error: " + err.message);
      } else {
        console.error("An unknown error occurred:", err);
      }

    return res.status(500).send('Server Error'); 
  }
})

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    const query = getQuery('../db/tasks/delete_task.sql');    
    const result = await pool.query(query, [id, userId]);	


    res.json({ message: 'Task deleted', task: result.rows[0] });
  } catch (err: unknown) {
      if(err instanceof Error) {
        console.error("Server Error: " + err.message);
      } else {
        console.error("An unknown error occurred:", err);
      }
    return res.status(500).send('Server Error'); 
  }
})

module.exports = router;