/**
 * PullGit - Main Entry Point
 * This file can be used as the main module for programmatic access
 */

const configManager = require('./src/config-manager');
const githubAuth = require('./src/github-auth');
const syncEngine = require('./src/sync-engine');
const syncScheduler = require('./src/sync-scheduler');
const deploymentManager = require('./src/deployment-manager');

module.exports = {
  configManager,
  githubAuth,
  syncEngine,
  syncScheduler,
  deploymentManager
};
