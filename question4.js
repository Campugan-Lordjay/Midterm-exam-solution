//http://localhost:3000/tasks

const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(express.json());

const db = new sqlite3.Database('./tasks.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL
        )`);
    }
});

app.post('/tasks', (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required' });
    }

    const query = `INSERT INTO tasks (name, description) VALUES (?, ?)`;
    db.run(query, [name, description], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Error inserting task', error: err.message });
        }
        res.status(201).json({ message: 'Task added successfully', id: this.lastID });
    });
});

app.get('/tasks', (req, res) => {
    const query = `SELECT * FROM tasks`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving tasks', error: err.message });
        }
        res.json(rows);
    });
});

app.put('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const { name, description } = req.body;

    const query = `UPDATE tasks SET name = ?, description = ? WHERE id = ?`;
    db.run(query, [name, description, taskId], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Error updating task', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task updated successfully' });
    });
});

app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;

    const query = `DELETE FROM tasks WHERE id = ?`;
    db.run(query, [taskId], function (err) {
        if (err) {
            return res.status(500).json({ message: 'Error deleting task', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});