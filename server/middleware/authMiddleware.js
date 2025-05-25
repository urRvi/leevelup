const jwt = require('jsonwebtoken');
const User = require('../models/model').User; // Adjust path as necessary
require('dotenv').config({ path: '../config.env' }); // Adjust path as necessary

module.exports = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied (malformed header)' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select('-password'); // Attach user to request, exclude password
        if (!req.user) {
            return res.status(401).json({ message: 'User not found, authorization denied' });
        }
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token is not valid (expired)' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token is not valid (malformed/invalid)' });
        }
        res.status(500).json({ message: 'Server error during token validation', error: error.message });
    }
};
