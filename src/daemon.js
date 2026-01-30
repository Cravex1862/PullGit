#!/usr/bin/env node

/**
 * PullGit Scheduler Service
 * Run this to keep auto-sync running in the background on your VPS
 * 
 * Usage:
 *   node src/daemon.js start   - Start the daemon
 *   node src/daemon.js stop    - Stop the daemon
 *   node src/daemon.js status  - Check daemon status
 */

const scheduler = require('./sync-scheduler');
const configManager = require('./config-manager');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const PID_FILE = path.join(configManager.getConfigDir(), 'pullgit.pid');

class Daemon {
  start() {
    try {
      // Check if already running
      if (this.isRunning()) {
        console.log(chalk.yellow('\n⚠️  PullGit daemon is already running\n'));
        return;
      }

      // Save PID
      fs.writeFileSync(PID_FILE, process.pid.toString());

      // Start scheduler
      scheduler.start();

      console.log(chalk.green('\n✅ PullGit daemon started\n'));
      console.log(chalk.cyan('Auto-sync scheduler is now running in the background'));
      console.log(chalk.gray(`Log file: ${scheduler.logFile}\n`));

      // Keep process alive
      process.on('SIGINT', () => this.stop());
      process.on('SIGTERM', () => this.stop());
    } catch (error) {
      console.error(chalk.red(`\n❌ Failed to start daemon: ${error.message}\n`));
      process.exit(1);
    }
  }

  stop() {
    try {
      scheduler.stop();
      
      if (fs.existsSync(PID_FILE)) {
        fs.unlinkSync(PID_FILE);
      }

      console.log(chalk.green('\n✅ PullGit daemon stopped\n'));
      process.exit(0);
    } catch (error) {
      console.error(chalk.red(`\n❌ Failed to stop daemon: ${error.message}\n`));
      process.exit(1);
    }
  }

  isRunning() {
    try {
      if (!fs.existsSync(PID_FILE)) {
        return false;
      }

      const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8'));
      // Check if process exists (Unix-like systems)
      try {
        process.kill(pid, 0);
        return true;
      } catch {
        // Process doesn't exist, clean up
        fs.unlinkSync(PID_FILE);
        return false;
      }
    } catch {
      return false;
    }
  }

  status() {
    if (this.isRunning()) {
      console.log(chalk.green('\n✅ PullGit daemon is running\n'));
      console.log(chalk.cyan('Recent logs:\n'));
      console.log(scheduler.getLog());
    } else {
      console.log(chalk.yellow('\n⊘ PullGit daemon is not running\n'));
    }
  }
}

const daemon = new Daemon();

const command = process.argv[2];

switch (command) {
  case 'start':
    daemon.start();
    break;
  case 'stop':
    daemon.stop();
    break;
  case 'status':
    daemon.status();
    break;
  default:
    console.log('\nUsage: node daemon.js [start|stop|status]\n');
}
