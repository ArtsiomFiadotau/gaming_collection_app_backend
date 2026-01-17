import { Router } from "express";
const router = Router();
import checkAuth from '../middleware/check-auth';

import { users_signup, users_login, users_modify_user, users_delete } from "../controllers/users";

router.post("/signup", users_signup);

router.post('/login', users_login)

router.patch('/:userId', checkAuth, users_modify_user);

router.delete('/:userId', checkAuth, users_delete);

export default router;