import express from 'express';
import {signup} from "#controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post('/sign-up', signup)
authRouter.post('/sign-in', (req, res) => {
    res.send('POST request from sign-in');
})
authRouter.post('/sign-out', (req, res) => {
    res.send('POST request from sign-out');
})

export default authRouter;