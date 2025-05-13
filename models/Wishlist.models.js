module.exports = (sequelize, DataTypes) => {
  const Wishlist = sequelize.define(
    "Wishlist",
    {
      movieId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Movies",
          key: "id",
        },
      },
      addedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    { timestamps: true }
  );

  Wishlist.associate = (models) => {
    Wishlist.belongsTo(models.Wishlist, { foreignKey: "movieId" });
  };

  return Wishlist;
};
