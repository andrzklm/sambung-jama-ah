import { Router } from 'express';
import { KegiatanController } from '../controllers/kegiatanController.mjs';
import { isDKM, verifyToken } from '../middlewares/authMiddleware.mjs';

const router = Router();

router.get('/', verifyToken, KegiatanController.getAll);
router.get('/:id', verifyToken, KegiatanController.getById);
router.post('/', verifyToken, isDKM, KegiatanController.create);
router.put('/:id', verifyToken, isDKM, KegiatanController.update);
router.delete('/:id', verifyToken, isDKM, KegiatanController.remove);

export default router;
