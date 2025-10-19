const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('currentUser');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const user = await User.findById(decoded.id);
    
    if (!token) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    req.user = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;