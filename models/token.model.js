import mongoose from 'mongoose';
const { Schema } = mongoose;

const tokenSchema = new Schema({
    token: {
        type: String,
        required: true,
        index: true,
    },
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['refresh', 'resetPassword'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 30 * 86400,
    },
    blacklisted: {
        type: Boolean,
        default: false,
    },
},
    { timestamps: true }
);

/**
* @typedef Token
*/
const Token = mongoose.model('Token', tokenSchema);

export { Token };
