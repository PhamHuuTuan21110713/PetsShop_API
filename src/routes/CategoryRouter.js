import express from 'express';
import * as CategoryController from '../controllers/CategoryController.js';

const router = express.Router();

router.post('/', CategoryController.createCategory);
router.get('/', CategoryController.getCategories);

export default router;
