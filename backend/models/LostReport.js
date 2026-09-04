const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const LostReport = sequelize.define('LostReport', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `LST-${Math.floor(100 + Math.random() * 900)}`
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
  lastSeenLocation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dateLost: {
    type: DataTypes.STRING,
    allowNull: false
  },
  approxTime: {
    type: DataTypes.STRING,
    defaultValue: '12:00'
  },
  features: {
    type: DataTypes.TEXT,
    defaultValue: '-'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reporterName: {
    type: DataTypes.STRING,
    defaultValue: 'Civitas Kampus'
  },
  reporterNim: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reporterPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reporterTelegram: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING, // 'pending', 'ai_matched', 'verified', 'resolved'
    defaultValue: 'pending'
  },
  matchedItemId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  matchScore: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  matchReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adminValidationNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'lost_reports',
  timestamps: true
});

module.exports = LostReport;
