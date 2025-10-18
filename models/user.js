module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define("User", {
        googleId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        picture: {
            type: DataTypes.STRING,
            allowNull: true
        },
        role: {
            type: DataTypes.ENUM('customer', 'admin', 'staff'),
            defaultValue: 'customer',
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: true
        },
        emailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, {
        timestamps: true,
        hooks: {
            beforeCreate: (user) => {
                if (user.name && !user.firstName && !user.lastName) {
                    const nameParts = user.name.split(' ');
                    user.firstName = nameParts[0];
                    user.lastName = nameParts.slice(1).join(' ');
                }
            }
        }
    });

    User.associate = (models) => {
        // User can have many appointments
        User.hasMany(models.Appointment, { 
            foreignKey: 'userId',
            as: 'appointments'
        });
        
        // User can be linked to Customer record
        User.hasOne(models.Customer, {
            foreignKey: 'userId',
            as: 'customerProfile'
        });
    };

    return User;
};
