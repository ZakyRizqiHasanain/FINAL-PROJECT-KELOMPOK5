const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const FoundItem = sequelize.define('FoundItem', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `FND-${Math.floor(100 + Math.random() * 900)}`
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '-'
  },
  locationFound: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dateFound: {
    type: DataTypes.STRING,
    allowNull: false
  },
  timeFound: {
    type: DataTypes.STRING,
    defaultValue: '10:00'
  },
  storageLocation: {
    type: DataTypes.STRING,
    defaultValue: 'Posko Keamanan Pusat (Gedung Rektorat)'
  },
  foundBy: {
    type: DataTypes.STRING,
    defaultValue: 'Civitas Kampus'
  },
  features: {
    type: DataTypes.TEXT,
    defaultValue: '-'
  },
  status: {
    type: DataTypes.STRING, // 'stored', 'matched', 'verified', 'returned'
    defaultValue: 'stored'
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  returnedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'found_items',
  timestamps: true
});

module.exports = FoundItem;
