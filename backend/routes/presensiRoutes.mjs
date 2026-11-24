import { Router } from 'express';
import { PresensiController } from '../controllers/presensiController.mjs';
import { isDKM, verifyToken } from '../middlewares/authMiddleware.mjs';

const router = Router();

router.get('/me', verifyToken, PresensiController.getMyPresensi);
router.get('/dkm/all', verifyToken, isDKM, PresensiController.getAllForDKM);
router.post('/', verifyToken, PresensiController.create);
router.put('/:id', verifyToken, PresensiController.updatePresensi);
router.delete('/:id', verifyToken, PresensiController.deletePresensi);

export default router;
