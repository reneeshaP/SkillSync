import mongoose from 'mongoose';

const availabilitySlotSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'booked'],
    default: 'open'
  }
}, { timestamps: true });

availabilitySlotSchema.index({ mentor: 1, startTime: 1 });

const AvailabilitySlot = mongoose.model('AvailabilitySlot', availabilitySlotSchema);

export default AvailabilitySlot;
