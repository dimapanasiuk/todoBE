import { Request, Response, NextFunction } from 'express';
import { UserAuthDataType } from '../types';

const jwt = require("jsonwebtoken");

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // 1. If there is no token, it is 401
    return res.status(401).send('Token required for access.');
  }

  jwt.verify(token, process.env.ACCESS_SECRET, (err:  Error | null, user: UserAuthDataType) => {
    if (err) {
      // 2. If the token is expired, it's a 401. The frontend should refresh the token.
      if (err?.name === 'TokenExpiredError') {
        return res.status(401).send('The token has expired.');
      }
      
      // 3. If another error (invalid token), it's 403. Frontend should re-login.
      return res.status(403).send('Invalid token.');
    }
    
    req.user = user;
    next();
  });
}

module.exports = authMiddleware;