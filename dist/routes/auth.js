"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
require('dotenv').config();
const getQuery = require('../utils');
const router = express.Router();
router.post("/register", async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = getQuery('../db/login/create_user.sql');
        const result = await pool.query(query, [email, hashedPassword]);
        res.json({ user: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: "User already exists" });
    }
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const userQuery = getQuery('../db/login/get_user.sql');
    const result = await pool.query(userQuery, [email]);
    const user = result.rows[0];
    if (!user)
        return res.status(400).json({ error: "Incorrect login or password" });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
        return res.status(400).json({ error: "Incorrect login or password" });
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    const refreshTokensQuery = getQuery('../db/login/create_refresh_token.sql');
    await pool.query(refreshTokensQuery, [user.id, refreshToken]);
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(200).json({
        accessToken: accessToken,
        message: 'Login successful'
    });
});
router.post("/token", async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
        return res.sendStatus(401);
    const query = getQuery('../db/login/get_refresh_token.sql');
    const result = await pool.query(query, [refreshToken]);
    if (result.rows.length === 0)
        return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403);
        const accessToken = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: "1m" });
        res.json({ accessToken });
    });
});
router.post("/logout", async (req, res) => {
    const { refreshToken } = req.cookies;
    const query = getQuery('../db/login/delete_refresh_token.sql');
    await pool.query(query, [refreshToken]);
    res.sendStatus(204);
});
module.exports = router;
