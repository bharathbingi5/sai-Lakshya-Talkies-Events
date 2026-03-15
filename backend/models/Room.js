import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  image: {
    type: String,
    required: [true, 'Room image is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image must be a valid URL'
    }
  },
  price: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  basePackage: {
    type: Number,
    required: [true, 'Base package capacity is required'],
    min: [1, 'Base package must accommodate at least 1 person']
  },
  maxCapacity: {
    type: Number,
    required: [true, 'Maximum capacity is required'],
    min: [1, 'Maximum capacity must be at least 1'],
    validate: {
      validator: function(v) {
        return v >= this.basePackage;
      },
      message: 'Maximum capacity must be greater than or equal to base package'
    }
  },
  extraAdultCharge: {
    type: Number,
    required: [true, 'Extra adult charge is required'],
    min: [0, 'Extra adult charge cannot be negative']
  },
  extraChildCharge: {
    type: Number,
    required: [true, 'Extra child charge is required'],
    min: [0, 'Extra child charge cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Room description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  amenities: [{
    type: String,
    enum: ['ac', 'projector', 'sound-system', 'lighting', 'seating', 'decoration']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for available slots
roomSchema.virtual('availableSlots').get(function() {
  return this.maxCapacity - this.basePackage;
});

// Instance method to calculate extra charges
roomSchema.methods.calculateExtraCharges = function(adults, children) {
  const extraAdults = Math.max(0, adults - this.basePackage);
  const extraChildren = Math.max(0, children - (this.basePackage - adults));

  return {
    extraAdults,
    extraChildren,
    totalExtraCharge: (extraAdults * this.extraAdultCharge) + (extraChildren * this.extraChildCharge)
  };
};

// Static method to get active rooms
roomSchema.statics.getActiveRooms = function() {
  return this.find({ isActive: true }).sort({ price: 1 });
};

// Pre-save middleware
roomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Room = mongoose.model('Room', roomSchema);

export default Room;