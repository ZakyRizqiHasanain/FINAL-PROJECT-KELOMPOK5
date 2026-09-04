const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `usr-${Date.now()}`
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nim: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nip: {
    type: DataTypes.STRING,
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
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  telegramUsername: {
    type: DataTypes.STRING,
    allowNull: true
  },
  telegramChatId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.TEXT,
    defaultValue: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;
