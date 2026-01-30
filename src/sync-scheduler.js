const cron = require('node-cron');
const configManager = require('./config-manager');
const syncEngine = require('./sync-engine');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class SyncScheduler {
  constructor() {
    this.jobs = new Map();
    this.logFile = path.join(configManager.getConfigDir(), 'sync.log');
  }

  start() {
    const config = configManager.loadConfig();
    
    if (!config.autoSync) {
      this.log('Auto-sync is disabled');
      return;
    }

    const repos = configManager.getRepositories();
    
    repos.forEach(repo => {
      if (repo.autoSync && repo.syncInterval > 0) {
        this.scheduleRepository(repo);
      }
    });

    if (this.jobs.size > 0) {
      this.log(`Scheduler started with ${this.jobs.size} active repository(ies)`);
    }
  }

  scheduleRepository(repo) {
    const intervalSeconds = repo.syncInterval;
    const cronExpression = this.secondsToCron(intervalSeconds);

    try {
      const job = cron.schedule(cronExpression, async () => {
        await this.syncRepository(repo);
      });

      this.jobs.set(repo.url, job);
      this.log(`Scheduled ${repo.fullName} - every ${intervalSeconds} seconds`);
    } catch (error) {
      this.log(`Failed to schedule ${repo.fullName}: ${error.message}`);
    }
  }

  async syncRepository(repo) {
    try {
      const repoPath = syncEngine.getRepositoryPath(repo.name);

      if (!fs.existsSync(repoPath)) {
        // Clone repository
        await syncEngine.cloneRepository(repo.url, repo.name, repo.isPrivate);
        this.log(`Cloned: ${repo.fullName}`);
      } else {
        // Pull latest changes
        await syncEngine.pullRepository(repo.name);
        this.log(`Synced: ${repo.fullName}`);
      }

      // Update last sync time
      configManager.updateRepository(repo.url, {
        lastSync: new Date().toISOString()
      });
    } catch (error) {
      this.log(`Error syncing ${repo.fullName}: ${error.message}`);
    }
  }

  stop() {
    this.jobs.forEach((job, repoUrl) => {
      job.stop();
      job.destroy();
    });
    this.jobs.clear();
    this.log('Scheduler stopped');
  }

  stopRepository(repoUrl) {
    const job = this.jobs.get(repoUrl);
    if (job) {
      job.stop();
      job.destroy();
      this.jobs.delete(repoUrl);
      this.log(`Stopped scheduling for: ${repoUrl}`);
    }
  }

  restartRepository(repo) {
    this.stopRepository(repo.url);
    if (repo.autoSync && repo.syncInterval > 0) {
      this.scheduleRepository(repo);
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    // Log to file
    try {
      fs.appendFileSync(this.logFile, logMessage);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  getLog() {
    try {
      if (fs.existsSync(this.logFile)) {
        return fs.readFileSync(this.logFile, 'utf-8');
      }
    } catch (error) {
      return 'Unable to read log file';
    }
  }

  secondsToCron(seconds) {
    if (seconds < 60) {
      return `*/${Math.max(1, Math.floor(seconds / 60))} * * * * *`; // Every N minutes
    }
    
    const minutes = Math.floor(seconds / 60);
    
    if (minutes < 60) {
      return `0 */${minutes} * * *`; // Every N minutes
    }
    
    const hours = Math.floor(minutes / 60);
    return `0 0 */${hours} * *`; // Every N hours
  }
}

module.exports = new SyncScheduler();
