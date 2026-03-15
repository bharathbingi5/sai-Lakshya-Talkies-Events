import express from 'express';
import { body, validationResult } from 'express-validator';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get all bookings (admin only)
// @access  Private (Admin)
router.get('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Booking.countDocuments();

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private (Admin)
router.get('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Public
router.post('/', [
  body('customerName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian phone number'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('roomId')
    .notEmpty()
    .withMessage('Room selection is required'),
  body('date')
    .isISO8601()
    .withMessage('Please enter a valid date'),
  body('timeSlot')
    .isIn(["10:00 AM - 01:00 PM", "01:30 PM - 04:30 PM", "05:00 PM - 08:00 PM", "08:30 PM - 11:30 PM"])
    .withMessage('Please select a valid time slot'),
  body('adults')
    .isInt({ min: 1, max: 100 })
    .withMessage('Number of adults must be between 1 and 100'),
  body('children')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Number of children must be between 0 and 50'),
  body('addons')
    .optional()
    .isArray()
    .withMessage('Addons must be an array'),
  body('totalPrice')
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number'),
  body('paymentOption')
    .isIn(['full', 'half'])
    .withMessage('Payment option must be either full or half'),
  body('paymentMethod')
    .isIn(['online', 'manual'])
    .withMessage('Payment method must be either online or manual'),
  body('amountPaid')
    .isFloat({ min: 0 })
    .withMessage('Amount paid must be a positive number')
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

    const {
      customerName,
      phone,
      email,
      roomId,
      date,
      timeSlot,
      adults,
      children = 0,
      addons = [],
      totalPrice,
      paymentOption,
      paymentMethod,
      amountPaid,
      transactionId,
      notes
    } = req.body;

    // Check if room exists and is active
    const room = await Room.findOne({ roomId, isActive: true });
    if (!room) {
      return res.status(400).json({
        success: false,
        message: 'Selected room is not available'
      });
    }

    // Check for booking conflicts
    const existingBooking = await Booking.findOne({
      roomId,
      date,
      timeSlot,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked for the selected date'
      });
    }

    // Generate unique booking ID
    const bookingId = `SLT-${Date.now().toString().slice(-6)}`;

    // Determine status based on payment method
    let status = 'pending';
    let paymentStatus = 'pending';

    if (paymentMethod === 'online') {
      status = 'confirmed';
      paymentStatus = paymentOption === 'full' ? 'completed' : 'partial';
    }

    // Create booking
    const booking = await Booking.create({
      bookingId,
      customerName,
      phone,
      email,
      roomId,
      date,
      timeSlot,
      adults,
      children,
      addons,
      totalPrice,
      paymentOption,
      paymentMethod,
      amountPaid,
      status,
      paymentStatus,
      transactionId,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking status
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { status, paymentStatus, notes } = req.body;

    const booking = await Booking.findOne({ bookingId: req.params.id });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update fields
    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (notes !== undefined) booking.notes = notes;

    await booking.save();

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Delete booking
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({ bookingId: req.params.id });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/bookings/analytics/summary
// @desc    Get booking analytics
// @access  Private (Admin)
router.get('/analytics/summary', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const totalRevenue = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        totalRevenue: revenue,
        conversionRate: totalBookings > 0 ? (confirmedBookings / totalBookings * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;