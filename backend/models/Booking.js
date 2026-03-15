import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  roomId: {
    type: String,
    required: [true, 'Room selection is required']
  },
  date: {
    type: String,
    required: [true, 'Booking date is required'],
    validate: {
      validator: function(v) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Date must be in YYYY-MM-DD format'
    }
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    enum: {
      values: ["10:00 AM - 01:00 PM", "01:30 PM - 04:30 PM", "05:00 PM - 08:00 PM", "08:30 PM - 11:30 PM"],
      message: 'Invalid time slot selected'
    }
  },
  adults: {
    type: Number,
    required: [true, 'Number of adults is required'],
    min: [1, 'At least 1 adult is required'],
    max: [100, 'Maximum 100 adults allowed']
  },
  children: {
    type: Number,
    default: 0,
    min: [0, 'Children count cannot be negative'],
    max: [50, 'Maximum 50 children allowed']
  },
  addons: [{
    type: String,
    enum: ['fog', 'balloons', 'candles', 'photography', 'videography']
  }],
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  paymentOption: {
    type: String,
    required: [true, 'Payment option is required'],
    enum: {
      values: ['full', 'half'],
      message: 'Payment option must be either full or half'
    }
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['online', 'manual'],
      message: 'Payment method must be either online or manual'
    }
  },
  amountPaid: {
    type: Number,
    required: [true, 'Amount paid is required'],
    min: [0, 'Amount paid cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    sparse: true,
    index: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for date and time slot to prevent double booking
bookingSchema.index({ date: 1, timeSlot: 1, roomId: 1 });

// Virtual for remaining balance
bookingSchema.virtual('remainingBalance').get(function() {
  return this.totalPrice - this.amountPaid;
});

// Instance method to check if booking is fully paid
bookingSchema.methods.isFullyPaid = function() {
  return this.amountPaid >= this.totalPrice;
};

// Static method to get bookings by date range
bookingSchema.statics.getBookingsByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1, timeSlot: 1 });
};

// Pre-save middleware to update updatedAt
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;