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
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
require('dotenv').config();
const getQuery = require('../utils');
const router = express.Router();
// registration
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const hashedPassword = yield bcrypt.hash(password, 10);
        const query = getQuery('../db/login/create_user.sql');
        const result = yield pool.query(query, [email, hashedPassword]);
        res.json({ user: result.rows[0] });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: "User already exists" });
    }
}));
// login
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const userQuery = getQuery('../db/login/get_user.sql');
    const result = yield pool.query(userQuery, [email]);
    const user = result.rows[0];
    if (!user)
        return res.status(400).json({ error: "Incorrect login or password" });
    const isValid = yield bcrypt.compare(password, user.password);
    if (!isValid)
        return res.status(400).json({ error: "Incorrect login or password" });
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    const refreshTokensQuery = getQuery('../db/login/create_refresh_token.sql');
    yield pool.query(refreshTokensQuery, [user.id, refreshToken]);
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in seconds
    });
    res.status(200).json({
        accessToken: accessToken,
        message: 'Login successful'
    });
}));
// update access token
router.post("/token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
        return res.sendStatus(401);
    const query = getQuery('../db/login/get_refresh_token.sql');
    const result = yield pool.query(query, [refreshToken]);
    if (result.rows.length === 0)
        return res.sendStatus(403);
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403);
        const accessToken = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: "1m" });
        res.json({ accessToken });
    });
}));
// logout
router.post("/logout", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    const query = getQuery('../db/login/delete_refresh_token.sql');
    yield pool.query(query, [refreshToken]);
    res.sendStatus(204);
}));
module.exports = router;
