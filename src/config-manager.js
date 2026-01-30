const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.gitdeploy');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const REPOS_DIR = path.join(CONFIG_DIR, 'repositories');

// Encryption key for storing tokens (using a static key - in production, use better method)
const ENCRYPTION_KEY = 'gitdeploy-secure-key-2026';

class ConfigManager {
  constructor() {
    this.ensureConfigDir();
  }

  ensureConfigDir() {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    if (!fs.existsSync(REPOS_DIR)) {
      fs.mkdirSync(REPOS_DIR, { recursive: true });
    }
  }

  configExists() {
    return fs.existsSync(CONFIG_FILE);
  }

  loadConfig() {
    try {
      if (!this.configExists()) {
        return this.createDefaultConfig();
      }
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading config:', error);
      return this.createDefaultConfig();
    }
  }

  saveConfig(config) {
    try {
      this.ensureConfigDir();
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save config: ${error.message}`);
    }
  }

  createDefaultConfig() {
    return {
      repositories: [],
      githubToken: null,
      syncInterval: 300, // 5 minutes
      autoSync: true
    };
  }

  addRepository(repo) {
    const config = this.loadConfig();
    // Check if repo already exists
    const exists = config.repositories.some(r => r.url === repo.url);
    if (exists) {
      throw new Error('Repository already exists in configuration');
    }
    config.repositories.push(repo);
    this.saveConfig(config);
    return repo;
  }

  updateRepository(repoUrl, updates) {
    const config = this.loadConfig();
    const index = config.repositories.findIndex(r => r.url === repoUrl);
    if (index === -1) {
      throw new Error('Repository not found');
    }
    config.repositories[index] = { ...config.repositories[index], ...updates };
    this.saveConfig(config);
    return config.repositories[index];
  }

  removeRepository(repoUrl) {
    const config = this.loadConfig();
    config.repositories = config.repositories.filter(r => r.url !== repoUrl);
    this.saveConfig(config);
  }

  getRepositories() {
    const config = this.loadConfig();
    return config.repositories;
  }

  getRepository(repoUrl) {
    const config = this.loadConfig();
    return config.repositories.find(r => r.url === repoUrl);
  }

  setGithubToken(token) {
    const config = this.loadConfig();
    config.githubToken = this.encryptToken(token);
    this.saveConfig(config);
  }

  getGithubToken() {
    const config = this.loadConfig();
    if (!config.githubToken) return null;
    return this.decryptToken(config.githubToken);
  }

  encryptToken(token) {
    const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decryptToken(encrypted) {
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  getReposDir() {
    return REPOS_DIR;
  }

  getConfigDir() {
    return CONFIG_DIR;
  }
}

module.exports = new ConfigManager();
