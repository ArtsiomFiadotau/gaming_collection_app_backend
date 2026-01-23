import { Router } from "express";
const router = Router();
import checkAuth from '../middleware/check-auth.js';

import { users_signup, users_login, users_modify_user, users_delete, users_get_single } from "../controllers/users.js";

router.get("/:userId", users_get_single);

router.post("/signup", users_signup);

router.post('/login', users_login)

router.patch('/:userId', users_modify_user);

router.delete('/:userId', checkAuth, users_delete);

export default router;