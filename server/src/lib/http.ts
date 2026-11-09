import express from 'express';

export const bearer = (req: express.Request) =>
  req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : '';
