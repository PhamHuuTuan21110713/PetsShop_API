import express from 'express';
import * as ReviewController from '../controllers/ReviewController.js'


const router = express.Router();

router.post("/", ReviewController.createReview);
router.get('/:entityId/:type', ReviewController.getReviews);

export default router;