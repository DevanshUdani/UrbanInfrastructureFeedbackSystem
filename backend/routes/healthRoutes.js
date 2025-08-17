
// backend/routes/healthRoutes.js
// Public health check endpoint (no auth)

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ ok: true, time: new Date().toISOString() });
});

module.exports = router;
