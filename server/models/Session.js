import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AvailabilitySlot',
    required: true
  },
  topic: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'declined', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

sessionSchema.index({ mentor: 1, status: 1 });
sessionSchema.index({ mentee: 1, status: 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
