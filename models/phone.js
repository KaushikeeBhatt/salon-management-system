module.exports = function (sequelize, DataTypes) {
    var Phone = sequelize.define("Phone", {
        mobile: {
            type: DataTypes.STRING,
        },
        home: {
            type: DataTypes.STRING,
        },
    });

    Phone.associate = function (models) {
        Phone.hasMany(models.Salon, {
            onDelete: "cascade",
            foreignKey: {
                allowNull: true,
            },
        });
        Phone.hasMany(models.Customer, {
            onDelete: "cascade",
            foreignKey: {
                allowNull: true,
            },
        });
        Phone.hasMany(models.Staff, {
            onDelete: "cascade",
            foreignKey: {
                allowNull: true,
            },
        });
    };
    return Phone;
};