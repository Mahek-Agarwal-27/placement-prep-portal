const express = require('express');
const router = express.Router();
const { exportUserData, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/export-data', exportUserData);
router.delete('/delete-account', deleteAccount);

module.exports = router;
