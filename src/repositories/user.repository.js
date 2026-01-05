const NotFound = require('../errors/notfound.error');
const {User} = require('../models');

class UserRepository {
    async createUser(data) {
        const user = new User(data);
        return await user.save();
    }

    //find by email
    async findByEmail(email) {
        return await User.findOne({ email });
    }

    //update password
    async updatePassword(email, newPassword) {
        try {
            const user = await User.findOneAndUpdate(
                { email },
                { password: newPassword },
                { new: true }
            ).select('username role');

            if (!user) {
                throw new NotFound('User not found');
            }

            return { username: user.username, role: user.role };
        } catch (err) {
            throw err;
        }
    }

    async deleteUserByEmail(email) {
        const user = await User.findOneAndDelete({ email });
        if (!user) {
            throw new NotFound('User not found');
        }

        return user;
    }

}

module.exports = UserRepository;