const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token after "Bearer"
    
    console.log("Token received:", token);  // Log the token to verify

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    jwt.verify(token, 'SECRET_KEY', (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(401).json({ message: 'Failed to authenticate token' });
        }
        
        console.log('Decoded token:', decoded); // Add this log
        req.userId = decoded.id;
        req.username = decoded.username;
        next();
    });
};

module.exports = verifyToken;
