import * as ReviewService from '../services/ReviewService';

 const createReview = async (req, res) => {
  const newData = req.body;
console.log("newData", newData);

  try {
    const newReview = await ReviewService.createReview(newData);
    return res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getReviews = async (req, res) => {
  const { entityId, type } = req.params;

  try {
    const reviews = await ReviewService.getReviews(entityId, type);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
};

export {
    createReview,
    getReviews
}

