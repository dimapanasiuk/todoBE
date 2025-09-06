"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const express = require('express');
const { pool } = require('../db');
const getQuery = require('../utils');
const router = express.Router();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const { userId } = req.user;
        const query = getQuery('../db/tasks/get_tasks.sql');
        const result = yield pool.query(query, [userId]);
        res.status(200).send(result.rows);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Server Error: " + err.message);
        }
        else {
            console.error("An unknown error occurred:", err);
        }
        return res.status(500).send('Server Error');
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, created_at, deadline_date, status, priority, color } = req.body;
        const { userId } = req.user;
        const id = (0, crypto_1.randomUUID)();
        const query = getQuery('../db/tasks/insert_task.sql');
        const result = yield pool.query(query, [id, title, description, created_at, deadline_date, status, priority, color, userId]);
        return res.status(201).json(result.rows[0]);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Server Error: " + err.message);
        }
        else {
            console.error("An unknown error occurred:", err);
        }
        return res.status(500).send('Server Error');
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const query = getQuery('../db/tasks/get_task.sql');
        const result = yield pool.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Server Error: " + err.message);
        }
        else {
            console.error("An unknown error occurred:", err);
        }
        return res.status(500).send('Server Error');
    }
}));
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        const { title, description, deadline_date, status, priority, color } = req.body;
        const query = getQuery('../db/tasks/update_task.sql');
        const result = yield pool.query(query, [title, description, deadline_date, status, priority, color, id, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(result.rows[0]);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Server Error: " + err.message);
        }
        else {
            console.error("An unknown error occurred:", err);
        }
        return res.status(500).send('Server Error');
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        const query = getQuery('../db/tasks/delete_task.sql');
        const result = yield pool.query(query, [id, userId]);
        res.json({ message: 'Task deleted', task: result.rows[0] });
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Server Error: " + err.message);
        }
        else {
            console.error("An unknown error occurred:", err);
        }
        return res.status(500).send('Server Error');
    }
}));
module.exports = router;
