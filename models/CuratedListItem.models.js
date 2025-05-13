module.exports = (sequelize, DataTypes) => {
  const CuratedListItem = sequelize.define(
    "CuratedListItem",
    {
      curatedListId: {
        type: DataTypes.INTEGER,
        references: {
          model: "CuratedLists",
          key: "id",
        },
      },
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

  CuratedListItem.associate = (models) => {
    CuratedListItem.belongsTo(models.CuratedList, {
      foreignKey: "curatedListId",
    });

    CuratedListItem.belongsTo(models.Movie, { foreignKey: "movieId" });
  };

  return CuratedListItem;
};
