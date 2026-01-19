import { Router } from "express";
const router = Router();
import checkAuth from '../middleware/check-auth.js';

import { users_signup, users_login, users_modify_user, users_delete } from "../controllers/users.js";

router.post("/signup", users_signup);

router.post('/login', users_login)

router.patch('/:userId', users_modify_user);

router.delete('/:userId', users_delete);

export default router;