INSERT INTO tasks (id, title, description, created_at, updated_at, deadline_date, status, priority, color, user_id)
VALUES ($1,$2,$3,$4,NOW(),$5,$6,$7,$8,$9)
RETURNING *;
