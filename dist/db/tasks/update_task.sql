UPDATE tasks
  SET title = $1,
    description = $2,
    deadline_date = $3,
    status = $4,
    priority = $5,
    color = $6,
    updated_at = NOW()
  WHERE id = $7 AND user_id = $8
RETURNING *