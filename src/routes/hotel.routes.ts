import { Router } from 'express';
import { HotelController } from '../controllers/hotel.controller';

const router = Router();
const hotelController = new HotelController();

router.get('/', hotelController.getAllHotels);
router.get('/:id', hotelController.getHotelById);
router.post('/', hotelController.createHotel);
router.put('/:id', hotelController.updateHotel);
router.delete('/:id', hotelController.deleteHotel);

export default router;
