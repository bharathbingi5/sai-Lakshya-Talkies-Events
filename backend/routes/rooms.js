import express from 'express';
import { body, validationResult } from 'express-validator';
import Room from '../models/Room.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/rooms
// @desc    Get all active rooms
// @access  Public
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({ price: 1 });

    res.json({
      success: true,
      data: { rooms }
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get single room
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.id, isActive: true });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      data: { room }
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/rooms
// @desc    Create new room (admin only)
// @access  Private (Admin)
router.post('/', [
  protect,
  authorize('admin'),
  body('roomId')
    .trim()
    .notEmpty()
    .withMessage('Room ID is required'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Room name must be between 2 and 100 characters'),
  body('image')
    .isURL()
    .withMessage('Valid image URL is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('basePackage')
    .isInt({ min: 1 })
    .withMessage('Base package must be at least 1'),
  body('maxCapacity')
    .isInt({ min: 1 })
    .withMessage('Maximum capacity must be at least 1'),
  body('extraAdultCharge')
    .isFloat({ min: 0 })
    .withMessage('Extra adult charge must be a positive number'),
  body('extraChildCharge')
    .isFloat({ min: 0 })
    .withMessage('Extra child charge must be a positive number'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const roomData = req.body;

    // Check if room ID already exists
    const existingRoom = await Room.findOne({ roomId: roomData.roomId });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Room ID already exists'
      });
    }

    const room = await Room.create(roomData);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room }
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update room (admin only)
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.id });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const allowedFields = [
      'name', 'image', 'price', 'basePackage', 'maxCapacity',
      'extraAdultCharge', 'extraChildCharge', 'description',
      'isActive', 'amenities'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        room[field] = req.body[field];
      }
    });

    await room.save();

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: { room }
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete room (admin only)
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ roomId: req.params.id });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/rooms/analytics/availability
// @desc    Get room availability for a date
// @access  Public
router.get('/availability/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const rooms = await Room.find({ isActive: true });

    // For each room, check availability for each time slot
    const availability = await Promise.all(
      rooms.map(async (room) => {
        const bookings = await Booking.find({
          roomId: room.roomId,
          date,
          status: { $in: ['confirmed', 'pending'] }
        }).select('timeSlot');

        const bookedSlots = bookings.map(b => b.timeSlot);
        const allSlots = ["10:00 AM - 01:00 PM", "01:30 PM - 04:30 PM", "05:00 PM - 08:00 PM", "08:30 PM - 11:30 PM"];

        return {
          roomId: room.roomId,
          name: room.name,
          availableSlots: allSlots.filter(slot => !bookedSlots.includes(slot)),
          bookedSlots
        };
      })
    );

    res.json({
      success: true,
      data: { availability, date }
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;