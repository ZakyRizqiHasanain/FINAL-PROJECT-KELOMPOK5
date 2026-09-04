const fs = require('fs');
const path = require('path');
const initialData = require('./dummyData');
const { sequelize, User, LostReport, FoundItem } = require('../models');

const DB_FILE = path.join(__dirname, 'db.json');

class Database {
  constructor() {
    this.data = { ...initialData };
    this.models = { User, LostReport, FoundItem, sequelize };
    this.isSequelizeConnected = false;
    this.init();
    this.initSequelize();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('⚠️ Menggunakan data dummy awal:', err.message);
      this.data = { ...initialData };
    }
  }

  async initSequelize() {
    try {
      await sequelize.authenticate();
      this.isSequelizeConnected = true;
      console.log(`✅ [Sequelize ORM Terhubung]: Database PostgreSQL aktif & terautentikasi.`);
      
      // Auto-sync schema tables
      await sequelize.sync({ alter: true });
      console.log(`✨ [Sequelize ORM Sync]: Seluruh skema model (User, LostReport, FoundItem) berhasil disinkronkan.`);
    } catch (err) {
      this.isSequelizeConnected = false;
      console.warn(`⚠️ [Sequelize ORM Offline/Fallback]: ${err.message}`);
    }
  }

  save() {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ Gagal menyimpan db.json:', err.message);
    }
  }

  get(collection) {
    return this.data[collection] || [];
  }

  find(collection, predicate) {
    const list = this.get(collection);
    return predicate ? list.filter(predicate) : list;
  }

  findOne(collection, predicate) {
    const list = this.get(collection);
    return list.find(predicate) || null;
  }

  findById(collection, id) {
    const list = this.get(collection);
    return list.find(item => item.id === id) || null;
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    const newItem = {
      id: item.id || `${collection.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      ...item
    };
    this.data[collection].unshift(newItem);
    this.save();

    // Async sync ke PostgreSQL via Sequelize ORM
    this.syncInsertToSequelize(collection, newItem).catch(() => {});

    return newItem;
  }

  update(collection, id, updates) {
    const list = this.get(collection);
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return null;

    this.data[collection][index] = {
      ...this.data[collection][index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();

    // Async sync update ke PostgreSQL via Sequelize ORM
    this.syncUpdateToSequelize(collection, id, updates).catch(() => {});

    return this.data[collection][index];
  }

  delete(collection, id) {
    const list = this.get(collection);
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return false;

    this.data[collection].splice(index, 1);
    this.save();

    // Async sync delete ke PostgreSQL via Sequelize ORM
    this.syncDeleteToSequelize(collection, id).catch(() => {});

    return true;
  }

  async syncInsertToSequelize(collection, item) {
    if (!this.isSequelizeConnected) return;
    try {
      if (collection === 'users') {
        await User.upsert({
          id: item.id,
          name: item.name,
          nim: item.nim || null,
          nip: item.nip || null,
          email: item.email,
          phone: item.phone || null,
          telegramUsername: item.telegramUsername || null,
          telegramChatId: item.telegramChatId || null,
          role: item.role || 'user',
          password: item.password,
          avatar: item.avatar || null
        });
      } else if (collection === 'foundItems') {
        await FoundItem.upsert({
          id: item.id,
          title: item.title,
          category: item.category,
          color: item.color || '-',
          locationFound: item.locationFound,
          dateFound: item.dateFound,
          timeFound: item.timeFound || '10:00',
          storageLocation: item.storageLocation || 'Posko Keamanan Pusat (Gedung Rektorat)',
          foundBy: item.foundBy || 'Civitas Kampus',
          features: item.features || '-',
          status: item.status || 'stored',
          imageUrl: item.imageUrl || null,
          returnedAt: item.returnedAt || null
        });
      } else if (collection === 'lostReports') {
        await LostReport.upsert({
          id: item.id,
          title: item.title,
          category: item.category,
          color: item.color || '-',
          lastSeenLocation: item.lastSeenLocation,
          dateLost: item.dateLost,
          approxTime: item.approxTime || '12:00',
          features: item.features || '-',
          description: item.description || null,
          reporterName: item.reporterName || 'Civitas Kampus',
          reporterNim: item.reporterNim || null,
          reporterPhone: item.reporterPhone || null,
          reporterTelegram: item.reporterTelegram || null,
          userId: item.userId || null,
          status: item.status || 'pending',
          matchedItemId: item.matchedItemId || null,
          matchScore: item.matchScore || null,
          matchReason: item.matchReason || null,
          adminValidationNotes: item.adminValidationNotes || null,
          resolvedAt: item.resolvedAt || null
        });
      }
    } catch (e) {
      console.warn(`[Sequelize Sync Error ${collection}]:`, e.message);
    }
  }

  async syncUpdateToSequelize(collection, id, updates) {
    if (!this.isSequelizeConnected) return;
    try {
      if (collection === 'lostReports') {
        await LostReport.update(updates, { where: { id } });
      } else if (collection === 'foundItems') {
        await FoundItem.update(updates, { where: { id } });
      } else if (collection === 'users') {
        await User.update(updates, { where: { id } });
      }
    } catch (e) {
      console.warn(`[Sequelize Update Error ${collection}]:`, e.message);
    }
  }

  async syncDeleteToSequelize(collection, id) {
    if (!this.isSequelizeConnected) return;
    try {
      if (collection === 'lostReports') {
        await LostReport.destroy({ where: { id } });
      } else if (collection === 'foundItems') {
        await FoundItem.destroy({ where: { id } });
      } else if (collection === 'users') {
        await User.destroy({ where: { id } });
      }
    } catch (e) {
      console.warn(`[Sequelize Delete Error ${collection}]:`, e.message);
    }
  }
}

const db = new Database();
module.exports = db;
