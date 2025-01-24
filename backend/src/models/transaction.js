import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';

const AutoIncrement = mongooseSequence(mongoose);

const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: Number,
        unique: true,
    },
    transactionHash: {
        type: String,
        unique: true,
        required: true,
    },
    walletAddress: {
        type: String,
        required: true,
        lowercase: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['BORROW', 'LEND', 'WITHDRAW', 'WHITELIST'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

transactionSchema.plugin(AutoIncrement, { inc_field: 'transactionId' });

export default mongoose.model('Transaction', transactionSchema);
