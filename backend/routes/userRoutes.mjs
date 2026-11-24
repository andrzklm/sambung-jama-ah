import { Router } from 'express';
import { UserController } from '../controllers/userController.mjs';
import { verifyToken } from '../middlewares/authMiddleware.mjs';

const router = Router();

router.get('/profile', verifyToken, UserController.getProfile);
router.put('/profile', verifyToken, UserController.updateProfile);

export default router;
