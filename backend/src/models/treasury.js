import mongoose from 'mongoose';
import mongooseSequence from 'mongoose-sequence';

const AutoIncrement = mongooseSequence(mongoose);

const treasurySchema = new mongoose.Schema({
    treasuryId: {
        type: Number,
        unique: true,
    },
    totalLent: {
        type: Number,
        default: 0,
    },
    totalBorrowed: {
        type: Number,
        default: 0,
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
}, { timestamps: true });

treasurySchema.plugin(AutoIncrement, { inc_field: 'treasuryId' });

export default mongoose.model('Treasury', treasurySchema);
