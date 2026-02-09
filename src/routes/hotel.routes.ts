import { Router } from 'express';
import { HotelController } from '../controllers/hotel.controller';
import { requireHotelOrSystemAdmin, requireHotelOwnership } from '../middleware/auth.middleware';

const router = Router();
const hotelController = new HotelController();

router.get('/', hotelController.getAllHotels);
router.get('/:id', hotelController.getHotelById);
router.post('/', requireHotelOrSystemAdmin, hotelController.createHotel);
router.put('/:id', requireHotelOrSystemAdmin, requireHotelOwnership, hotelController.updateHotel);
router.delete('/:id', requireHotelOrSystemAdmin, requireHotelOwnership, hotelController.deleteHotel);

export default router;
