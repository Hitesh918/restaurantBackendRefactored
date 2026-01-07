const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/server.config");

module.exports.generateToken = (payload) => {
    if (!JWT_SECRET || JWT_SECRET === 'default-secret-change-in-production-min-32-characters') {
        throw new Error('JWT_SECRET is not properly configured. Please set it in your .env file.');
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" }); // Extended to 24h for better UX
};

module.exports.verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
