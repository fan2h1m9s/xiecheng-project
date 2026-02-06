import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';

const router = Router();
const roomController = new RoomController();

router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);
router.get('/types/all', roomController.getAllRoomTypes);
router.post('/types', roomController.createRoomType);

export default router;
