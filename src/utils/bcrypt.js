const bcrypt = require('bcrypt');

module.exports.hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

module.exports.comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};
