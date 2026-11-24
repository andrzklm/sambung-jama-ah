import { Router } from 'express';
import { AuthController } from '../controllers/authController.mjs';
import { verifyToken } from '../middlewares/authMiddleware.mjs';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', verifyToken, AuthController.me);

export default router;
