// Bookings Controller

const { Booking, User, Service, Testimonial } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

// Get all bookings (with filters)
const getAllBookings = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const where = {};

        if (status) where.status = status;

        // Robust scoping:
        // 1) Prefer authenticated client id (req.user.user_id)
        // 2) Fallback to explicit user_id query param (frontend passes it)
        if (req.user?.user_id) {
            where.user_id = req.user.user_id;
        } else if (req.query.user_id) {
            where.user_id = req.query.user_id;
        }

        // Admin/staff can optionally request all bookings.
        if (req.user?.role === 'admin' || req.user?.role === 'staff') {
            if (req.query.user_id) {
                where.user_id = req.query.user_id;
            } else {
                delete where.user_id;
            }
        }



        const offset = (page - 1) * limit;

        const { count, rows } = await Booking.findAndCountAll({
            where,
            include: [
                { model: User, attributes: ['user_id', 'first_name', 'last_name', 'email'] },
                { model: Service, attributes: ['service_id', 'name', 'price'] }
            ],
            offset: parseInt(offset),
            limit: parseInt(limit),
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get booking by ID
const getBookingById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id, {
            include: [
                { model: User },
                { model: Service },
                { model: Testimonial }
            ]
        });

        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

// Create booking
const createBooking = async (req, res, next) => {
    try {
        const {
            service_id,
            event_date,
            event_location,
            number_of_participants,
            special_requests,
            preferred_time_start,
            preferred_time_end
        } = req.body;

        // Debugging: Log user and body to ensure data is received correctly
        console.log('createBooking: req.user:', req.user);
        console.log('createBooking: req.body:', req.body);
        // Get service for pricing
        const service = await Service.findByPk(service_id);
        if (!service) {
            return next(new AppError('Service not found', 404));
        }

        const booking = await Booking.create({
            user_id: req.user.user_id,
            service_id,
            booking_date: new Date(),
            event_date,
            event_location,
            number_of_participants,
            special_requests,
            preferred_time_start,
            preferred_time_end,
            total_price: service.price,
            status: 'pending'
        });

        // Reload with associations
        await booking.reload({
            include: [
                { model: User },
                { model: Service }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Booking request created successfully',
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

// Update booking status (Admin/Staff)
const updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (status && !validStatuses.includes(status)) {
            return next(new AppError('Invalid booking status', 400));
        }

        const booking = await Booking.findByPk(id);
        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (notes) updateData.notes = notes;

        await booking.update(updateData);

        res.json({
            success: true,
            message: 'Booking updated successfully',
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

// Update payment status
const updatePaymentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;

        const validPaymentStatuses = ['unpaid', 'paid', 'partial'];
        if (!validPaymentStatuses.includes(payment_status)) {
            return next(new AppError('Invalid payment status', 400));
        }

        const booking = await Booking.findByPk(id);
        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        await booking.update({ payment_status });

        res.json({
            success: true,
            message: 'Payment status updated',
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

// Delete booking
const deleteBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);

        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        // Only allow cancellation if pending or confirmed
        if (!['pending', 'confirmed'].includes(booking.status)) {
            return next(new AppError('Cannot delete booking with this status', 400));
        }

        await booking.destroy();

        res.json({
            success: true,
            message: 'Booking deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get bookings calendar (for admin dashboard)
const getBookingsCalendar = async (req, res, next) => {
    try {
        const { year, month } = req.query;
        
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const bookings = await Booking.findAll({
            where: {
                event_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                { model: User, attributes: ['first_name', 'last_name'] },
                { model: Service, attributes: ['name'] }
            ]
        });

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// multer storage to backend/uploads
const uploadsDir = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
            cb(null, uploadsDir);
        } catch (e) {
            cb(e);
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '';
        const base = path.basename(file.originalname, ext);
        const safeBase = base.replace(/[^a-z0-9\-_]/gi, '_').slice(0, 60);
        const unique = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
        cb(null, `${safeBase}_${unique}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// Staff upload delivered final file
const uploadCompletedFile = (req, res, next) => {
    const handler = upload.single('file');
    handler(req, res, async (err) => {
        if (err) return next(err);
        try {
            const { id } = req.params;
            if (!req.file) return next(new AppError('No file uploaded', 400));

            const booking = await Booking.findByPk(id);
            if (!booking) return next(new AppError('Booking not found', 404));

            const completed_file_url = `/uploads/${req.file.filename}`;

            // IMPORTANT:
            // completed_file_url is stored as the URL path (e.g. /uploads/xxx.jpeg).
            // Frontend must prefix backend origin for absolute access.
            await booking.update({
                completed_file_url,
                status: 'completed'
            });

            return res.json({
                success: true,
                message: 'Completed file uploaded successfully',
                completed_file_url
            });
        } catch (e) {
            next(e);
        }
    });
};

// Client cancel their own booking
const cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);

        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        // Clients can only cancel their own bookings
        if (req.user.role === 'client' && booking.user_id !== req.user.user_id) {
            return next(new AppError('Forbidden', 403));
        }

        if (!['pending', 'confirmed'].includes(booking.status)) {
            return next(new AppError('Cannot cancel a booking that is already completed or cancelled', 400));
        }

        await booking.update({ status: 'cancelled' });

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

// Client pay (instant success)
const payBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { mobile_number } = req.body;

        if (!mobile_number) return next(new AppError('mobile_number is required', 400));

        const booking = await Booking.findByPk(id);
        if (!booking) return next(new AppError('Booking not found', 404));

        // Ensure client owns the booking
        if (req.user.role === 'client' && booking.user_id !== req.user.user_id) {
            return next(new AppError('Forbidden', 403));
        }

        await booking.update({
            payment_status: 'paid',
            status: booking.status === 'completed' ? 'completed' : booking.status
        });

        return res.json({
            success: true,
            message: 'Payment successful',
            data: booking
        });
    } catch (e) {
        next(e);
    }
};

module.exports = {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    updatePaymentStatus,
    deleteBooking,
    getBookingsCalendar,
    uploadCompletedFile,
    payBooking
};
