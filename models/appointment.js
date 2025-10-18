module.exports = function (sequelize, DataTypes) {
    var Appointment = sequelize.define("Appointment", {
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 50]
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 50]
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
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        service: {
            type: DataTypes.STRING,
            allowNull: false
        },
        preferredDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        preferredTime: {
            type: DataTypes.STRING,
            allowNull: true
        },
        actualDateTime: {
            type: DataTypes.DATE,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
            defaultValue: 'pending',
            allowNull: false
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        confirmationCode: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true // For Google Auth user ID
        }
    }, {
        timestamps: true,
        hooks: {
            beforeCreate: (appointment) => {
                // Generate confirmation code
                appointment.confirmationCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            }
        }
    });

    Appointment.associate = (models) => {
        // Future associations can be added here
        // Appointment.belongsTo(models.Customer, { foreignKey: 'customerId' });
        // Appointment.belongsTo(models.Service, { foreignKey: 'serviceId' });
        // Appointment.belongsTo(models.Staff, { foreignKey: 'staffId' });
    };

    return Appointment;
};
