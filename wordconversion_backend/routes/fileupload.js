const express = require('express');
const { uploadFiles } = require('../controllers/fileupload');
const router = express.Router();

// File upload route
router.post('/pdf', uploadFiles);

module.exports = router;
