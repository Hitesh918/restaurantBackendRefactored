const NotFound = require('../errors/notfound.error');
const {User} = require('../models');

class UserRepository {
    async createUser(data) {
        const user = new User(data);
        return await user.save();
    }

    //find by email (case-insensitive)
    async findByEmail(email) {
        const normalizedEmail = email.toLowerCase().trim();
        return await User.findOne({ email: normalizedEmail });
    }

    //update password
    async updatePassword(email, newPassword) {
        try {
            const normalizedEmail = email.toLowerCase().trim();
            const user = await User.findOneAndUpdate(
                { email: normalizedEmail },
                { password: newPassword },
                { new: true }
            ).select('email role fullName');

            if (!user) {
                throw new NotFound('User not found');
            }

            return { email: user.email, role: user.role, fullName: user.fullName };
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

    async getAllUsers() {
        return await User.find({}).select('-password');
    }

    async getUsersByRole(role) {
        return await User.find({ role }).select('-password');
    }

    async findById(id) {
        return await User.findById(id).select('-password');
    }

    async updateUser(id, updateData) {
        return await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    }

    async deleteUser(id) {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new NotFound('User not found');
        }
        return user;
    }
}

module.exports = UserRepository;
