const { authClient } = require('../grpc/client');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    authClient.VerifyToken({ token }, (error, response) => {
        if (error) {
            return res.status(500).json({ error: 'Authentication failed' });
        }

        if (!response.valid) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        req.user = {
            userId: response.userId,
            email: response.email
        };
        next();
    });
}

module.exports = { authenticateToken };