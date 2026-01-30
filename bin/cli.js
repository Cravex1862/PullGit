#!/usr/bin/env node

const chalk = require('chalk');
const setupWizard = require('../src/setup-wizard');
const commandHandler = require('../src/command-handler');
const configManager = require('../src/config-manager');

const args = process.argv.slice(2);

async function main() {
  try {
    // Show welcome banner
    console.log(chalk.cyan.bold('\n╔════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║        PullGit - Auto Sync Tool      ║'));
    console.log(chalk.cyan.bold('╚════════════════════════════════════╝\n'));

    // Check if config exists
    const configExists = configManager.configExists();

    if (!configExists && args.length === 0) {
      // First time setup
      console.log(chalk.yellow('No configuration found. Starting setup wizard...\n'));
      await setupWizard.run();
    } else if (args.length > 0) {
      // Handle commands
      await commandHandler.handleCommand(args);
    } else {
      // Show menu
      await commandHandler.showMenu();
    }
  } catch (error) {
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

main();
