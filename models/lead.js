module.exports = function (sequelize, DataTypes) {
    const Lead = sequelize.define("Lead", {
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 100]
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 100]
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 20]
            }
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                isIn: [['General Inquiry', 'Appointment Booking', 'Special Occasion Consultation', 'Product Information', 'Feedback', 'Other']]
            }
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [10, 2000]
            }
        },
        status: {
            type: DataTypes.ENUM('new', 'read', 'responded', 'resolved'),
            defaultValue: 'new'
        },
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true
        },
        userAgent: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        timestamps: true,
        indexes: [
            { fields: ['email'] },
            { fields: ['status'] },
            { fields: ['createdAt'] }
        ]
    });

    return Lead;
};