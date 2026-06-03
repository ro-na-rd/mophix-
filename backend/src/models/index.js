// Database Models - Sequelize ORM Definitions

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

// =====================================================
// USER MODEL
// =====================================================

const User = sequelize.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    // Compatibility with your actual DB dump (../../users.sql)
    // Actual columns: password, full_name
    // New schema columns (password_hash, first_name, last_name) are kept as aliases.

    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password'
    },

    // Stored in DB as full_name
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'full_name'
    },

    last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        // DB dump does not have last_name; reuse full_name to avoid SQL errors
        field: 'full_name'
    },
    // phone column does not exist in your current DB; keep model compatible by omitting it.
    // phone: { ... }

    // NOTE: Even if the model omits `phone`, some legacy code paths may still request it.
    // If you hit `Unknown column 'User.phone'`, search for `phone` usage in:
    // - backend/src/controllers/auth.controller.js
    // - backend/src/controllers/bookings.controller.js
    // and align them with your actual `users` table columns.


    role: {
        type: DataTypes.ENUM('admin', 'staff', 'client'),
        defaultValue: 'client'
    },
    profile_image_url: {
        type: DataTypes.STRING(500)
    },
    bio: {
        type: DataTypes.TEXT
    },
    address: {
        type: DataTypes.STRING(255)
    },
    city: {
        type: DataTypes.STRING(100)
    },
    country: {
        type: DataTypes.STRING(100)
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_login: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'users',
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password_hash) {
                const salt = await bcrypt.genSalt(10);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password_hash')) {
                const salt = await bcrypt.genSalt(10);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }
        }
    }
});

User.prototype.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password_hash);
};

User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    return values;
};

// =====================================================
// CATEGORY MODEL
// =====================================================

const Category = sequelize.define('Category', {
    category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT
    },
    icon_url: {
        type: DataTypes.STRING(500)
    },
    display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'categories',
    timestamps: true
});

// =====================================================
// SERVICE MODEL
// =====================================================

const Service = sequelize.define('Service', {
    service_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    category: {
        type: DataTypes.STRING(100)
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    duration_hours: {
        type: DataTypes.INTEGER
    },
    includes_photos_count: {
        type: DataTypes.INTEGER
    },
    includes_album: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    includes_prints: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'services',
    timestamps: true
});

// =====================================================
// GALLERY MODEL
// =====================================================

const Gallery = sequelize.define('Gallery', {
    gallery_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    cover_image_path: {
        type: DataTypes.STRING(500)
    },
    event_type: {
        type: DataTypes.STRING(100)
    },
    photo_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    published_date: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'galleries',
    timestamps: true
});

// =====================================================
// PHOTO MODEL
// =====================================================

const Photo = sequelize.define('Photo', {
    photo_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    gallery_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Gallery,
            key: 'gallery_id'
        }
    },
    title: {
        type: DataTypes.STRING(200)
    },
    description: {
        type: DataTypes.TEXT
    },
    file_path: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    thumbnail_path: {
        type: DataTypes.STRING(500)
    },
    file_size: {
        type: DataTypes.INTEGER
    },
    image_width: {
        type: DataTypes.INTEGER
    },
    image_height: {
        type: DataTypes.INTEGER
    },
    upload_date: {
        type: DataTypes.DATE,
        defaultValue: sequelize.fn('NOW')
    },
    photographer_name: {
        type: DataTypes.STRING(100)
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'photos',
    timestamps: true,
    createdAt: false,
    updatedAt: false
});

// =====================================================
// BOOKING MODEL
// =====================================================

const Booking = sequelize.define('Booking', {
    booking_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Service,
            key: 'service_id'
        }
    },
    booking_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    preferred_time_start: {
        type: DataTypes.TIME
    },
    preferred_time_end: {
        type: DataTypes.TIME
    },
    event_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    event_location: {
        type: DataTypes.STRING(255)
    },
    number_of_participants: {
        type: DataTypes.INTEGER
    },
    special_requests: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        defaultValue: 'pending'
    },
    total_price: {
        type: DataTypes.DECIMAL(10, 2)
    },
    payment_status: {
        type: DataTypes.ENUM('unpaid', 'paid', 'partial'),
        defaultValue: 'unpaid'
    },
    notes: {
        type: DataTypes.TEXT
    },
    completed_file_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
}, {
    tableName: 'bookings',
    timestamps: true
});

// =====================================================
// TESTIMONIAL MODEL
// =====================================================

const Testimonial = sequelize.define('Testimonial', {
    testimonial_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    booking_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Booking,
            key: 'booking_id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        validate: {
            min: 1,
            max: 5
        }
    },
    title: {
        type: DataTypes.STRING(200)
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    photo_url: {
        type: DataTypes.STRING(500)
    },
    is_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    approved_by: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    approved_date: {
        type: DataTypes.DATE
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'testimonials',
    timestamps: true
});

// =====================================================
// CONTACT INQUIRY MODEL
// =====================================================

const ContactInquiry = sequelize.define('ContactInquiry', {
    inquiry_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20)
    },
    subject: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    inquiry_type: {
        type: DataTypes.ENUM('general', 'booking', 'feedback', 'complaint'),
        defaultValue: 'general'
    },
    status: {
        type: DataTypes.ENUM('new', 'in_progress', 'resolved', 'spam'),
        defaultValue: 'new'
    },
    responded_by: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    response_message: {
        type: DataTypes.TEXT
    },
    response_date: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'contact_inquiries',
    timestamps: true
});

// =====================================================
// BLOG CATEGORY MODEL
// =====================================================

const BlogCategory = sequelize.define('BlogCategory', {
    blog_category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT
    },
    display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'blog_categories',
    timestamps: true
});

// =====================================================
// BLOG POST MODEL
// =====================================================

const BlogPost = sequelize.define('BlogPost', {
    post_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    featured_image_url: {
        type: DataTypes.STRING(500)
    },
    category_id: {
        type: DataTypes.INTEGER,
        references: {
            model: BlogCategory,
            key: 'blog_category_id'
        }
    },
    author_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft'
    },
    view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    published_date: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'blog_posts',
    timestamps: true
});

// =====================================================
// ASSOCIATIONS (Relationships)
// =====================================================

// User associations
User.hasMany(Booking, { foreignKey: 'user_id' });
User.hasMany(Testimonial, { foreignKey: 'user_id' });
User.hasMany(ContactInquiry, { foreignKey: 'responded_by' });
User.hasMany(Gallery, { foreignKey: 'created_by' });
User.hasMany(BlogPost, { foreignKey: 'author_id' });

// Service associations
Service.hasMany(Booking, { foreignKey: 'service_id' });

// Gallery associations
Gallery.hasMany(Photo, { foreignKey: 'gallery_id' });
Gallery.belongsTo(User, { foreignKey: 'created_by' });

// Photo associations
Photo.belongsTo(Gallery, { foreignKey: 'gallery_id' });

// Booking associations
Booking.belongsTo(User, { foreignKey: 'user_id' });
Booking.belongsTo(Service, { foreignKey: 'service_id' });
Booking.hasMany(Testimonial, { foreignKey: 'booking_id' });

// Testimonial associations
Testimonial.belongsTo(User, { foreignKey: 'user_id' });
Testimonial.belongsTo(Booking, { foreignKey: 'booking_id' });
Testimonial.belongsTo(User, { foreignKey: 'approved_by', as: 'approvedBy' });

// ContactInquiry associations
ContactInquiry.belongsTo(User, { foreignKey: 'responded_by' });

// Blog associations
BlogPost.belongsTo(BlogCategory, { foreignKey: 'category_id' });
BlogPost.belongsTo(User, { foreignKey: 'author_id' });

module.exports = {
    sequelize,
    User,
    Category,
    Service,
    Gallery,
    Photo,
    Booking,
    Testimonial,
    ContactInquiry,
    BlogCategory,
    BlogPost
};
