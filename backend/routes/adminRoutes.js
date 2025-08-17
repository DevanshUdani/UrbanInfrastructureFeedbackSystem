const express = require('express');
const router = express.Router();
const { 
  adminLogin, 
  getAdminProfile, 
  updateAdminProfile, 
  getAllAdmins 
} = require('../controllers/adminController');
const { adminAuth, adminPermission, adminRole } = require('../middleware/adminAuthMiddleware');

// Public routes
router.post('/login', adminLogin);

// Protected routes
router.get('/profile', adminAuth, getAdminProfile);
router.put('/profile', adminAuth, updateAdminProfile);

// Super admin only routes
router.get('/all', adminAuth, adminRole('SUPER_ADMIN'), getAllAdmins);

module.exports = router;
