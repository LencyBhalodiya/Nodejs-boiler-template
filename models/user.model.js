import mongoose from 'mongoose';
const { Schema } = mongoose;
import bcrypt from 'bcryptjs';

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
},
    { timestamps: true }
);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.static('isEmailTaken', async function isEmailTaken(email, exludeUserId) {
    const user = await this.findOne({ email, _id: { $ne: exludeUserId } });
    return !!user;
});

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.method('isPasswordMatch', async function isPasswordMatch(password) {
    return bcrypt.compare(password, this.password);
});

/** @description encrypt password before saving in DB */
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password'))
        user.password = await bcrypt.hash(user.password, 8);

    next();
})


/**
* @typedef User 
*/
const User = mongoose.model('User', userSchema);

export { User };
