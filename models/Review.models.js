module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    "Review",
    {
      movieId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Movies",
          key: "id",
        },
      },
      rating: {
        type: DataTypes.FLOAT,
      },
      reviewText: {
        type: DataTypes.STRING,
      },
      addedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    { timestamps: true }
  );

  Review.associate = (models) => {
    Review.belongsTo(models.Movie, { foreignKey: "movieId" });
  };

  return Review;
};
