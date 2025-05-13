module.exports = (sequelize, DataTypes) => {
  const CuratedList = sequelize.define(
    "CuratedList",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    { timestamps: true }
  );

  CuratedList.associate = (models) => {
    CuratedList.hasMany(models.CuratedListItem, {
      foreignKey: "curatedListId",
    });
  };

  return CuratedList;
};
