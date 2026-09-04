const sequelize = require('../config/sequelize');
const User = require('./User');
const LostReport = require('./LostReport');
const FoundItem = require('./FoundItem');

// Associations (Relasi antar Tabel)
User.hasMany(LostReport, { foreignKey: 'userId', as: 'lostReports', onDelete: 'SET NULL' });
LostReport.belongsTo(User, { foreignKey: 'userId', as: 'user' });

FoundItem.hasMany(LostReport, { foreignKey: 'matchedItemId', as: 'matchedReports', onDelete: 'SET NULL' });
LostReport.belongsTo(FoundItem, { foreignKey: 'matchedItemId', as: 'matchedFoundItem' });

module.exports = {
  sequelize,
  User,
  LostReport,
  FoundItem
};
