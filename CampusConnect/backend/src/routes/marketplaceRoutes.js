const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    getListings,
    createListing,
    deleteListing
} = require('../controllers/marketplaceController');

const router = express.Router();

router.get('/', protect, getListings);
router.post('/', protect, createListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;