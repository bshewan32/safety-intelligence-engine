const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

class DatabaseService {
  constructor() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'safety_intelligence.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
  }

  async initialize() {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    this.db.exec(schema);
    console.log('Database initialized');
  }

  query(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.all(params);
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  execute(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      return stmt.run(params);
    } catch (error) {
      console.error('Execute error:', error);
      throw error;
    }
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseService;