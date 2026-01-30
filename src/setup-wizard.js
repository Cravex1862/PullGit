const inquirer = require('inquirer');
const chalk = require('chalk');
const githubAuth = require('./github-auth');
const configManager = require('./config-manager');
const syncEngine = require('./sync-engine');
const deploymentManager = require('./deployment-manager');
const fs = require('fs');
const path = require('path');

class SetupWizard {
  async run() {
    try {
      console.log(chalk.cyan('\n📋 Welcome to PullGit Setup Wizard\n'));
      
      // Step 1: GitHub Token (Optional for public repos)
      await this.setupGithubAuth();
      
      // Step 2: Add repositories
      await this.setupRepositories();
      
      // Step 3: Configure sync settings
      await this.configureSyncSettings();
      
      console.log(chalk.green('\n✅ Setup complete! Your configuration is ready.\n'));
      console.log(chalk.cyan('Next steps:'));
      console.log(chalk.white('  • Run: pullgit list    - to see your repositories'));
      console.log(chalk.white('  • Run: pullgit sync    - to manually sync repositories'));
      console.log(chalk.white('  • Run: pullgit help    - for more commands\n'));
    } catch (error) {
      throw error;
    }
  }

  async setupGithubAuth() {
    const { usePrivate } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'usePrivate',
        message: 'Do you have private GitHub repositories?',
        default: false
      }
    ]);

    if (usePrivate) {
      const { authMethod } = await inquirer.prompt([
        {
          type: 'list',
          name: 'authMethod',
          message: 'Choose authentication method:',
          choices: [
            { name: 'GitHub Personal Access Token (Recommended)', value: 'pat' },
            { name: 'OAuth (via GitHub)', value: 'oauth' }
          ]
        }
      ]);

      if (authMethod === 'pat') {
        await this.setupPAT();
      } else {
        console.log(chalk.yellow('\n⚠️  OAuth setup requires a web server. For now, please use PAT.\n'));
        await this.setupPAT();
      }
    } else {
      console.log(chalk.green('✓ Using public repository access only\n'));
    }
  }

  async setupPAT() {
    console.log(chalk.cyan('\n📖 Getting your Personal Access Token:\n'));
    console.log(chalk.white('1. Go to: https://github.com/settings/tokens'));
    console.log(chalk.white('2. Click "Generate new token" (classic)'));
    console.log(chalk.white('3. Select scopes: repo (all), read:user'));
    console.log(chalk.white('4. Copy the token (you won\'t see it again)\n'));

    const { token } = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Paste your GitHub token:',
        mask: '*'
      }
    ]);

    try {
      const validation = await githubAuth.validateToken(token);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      githubAuth.storeToken(token);
      console.log(chalk.green(`✓ Token saved for user: ${validation.user}\n`));
    } catch (error) {
      throw new Error(`Failed to validate token: ${error.message}`);
    }
  }

  async setupRepositories() {
    let addMore = true;

    while (addMore) {
      const { repoUrl } = await inquirer.prompt([
        {
          type: 'input',
          name: 'repoUrl',
          message: 'Enter GitHub repository URL (or empty to skip):',
          default: '',
          validate: (value) => {
            if (!value) return true;
            if (!/github\.com[/:]([\w-]+)\/([\w.-]+?)(?:\.git)?/.test(value)) {
              return 'Please enter a valid GitHub URL';
            }
            return true;
          }
        }
      ]);

      if (!repoUrl) {
        addMore = false;
        break;
      }

      try {
        await this.addRepository(repoUrl);
      } catch (error) {
        console.log(chalk.red(`✗ ${error.message}`));
      }
    }

    const repos = configManager.getRepositories();
    if (repos.length === 0) {
      console.log(chalk.yellow('\n⚠️  No repositories added. You can add them later with: pullgit add\n'));
    }
  }

  async addRepository(repoUrl) {
    const token = configManager.getGithubToken();
    
    // Validate repository access
    const access = await githubAuth.checkRepositoryAccess(repoUrl, token);
    if (!access.accessible) {
      throw new Error(`Cannot access repository: ${access.error}`);
    }

    // Get repository info
    const repoInfo = await githubAuth.getRepositoryInfo(repoUrl, token);
    
    // Extract repo name
    const repoName = repoInfo.name;

    // Ask for deployment type
    const deployments = deploymentManager.getDeploymentTypes();
    const { deploymentType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'deploymentType',
        message: `How should we deploy "${repoName}"?`,
        choices: deployments.map(d => ({
          name: `${d.name} - ${d.description}`,
          value: d.id
        }))
      }
    ]);

    // Ask for sync interval
    const { syncInterval } = await inquirer.prompt([
      {
        type: 'list',
        name: 'syncInterval',
        message: 'How often should we check for updates?',
        choices: [
          { name: 'Every 5 minutes', value: 300 },
          { name: 'Every 15 minutes', value: 900 },
          { name: 'Every 30 minutes', value: 1800 },
          { name: 'Every hour', value: 3600 },
          { name: 'Manual only', value: 0 }
        ],
        default: 300
      }
    ]);

    // Add to config
    const repo = {
      url: repoUrl,
      name: repoName,
      fullName: repoInfo.fullName,
      isPrivate: access.isPrivate,
      deploymentType: deploymentType,
      syncInterval: syncInterval,
      lastSync: null,
      autoSync: syncInterval > 0
    };

    configManager.addRepository(repo);
    console.log(chalk.green(`✓ Added repository: ${repoInfo.fullName}`));
  }

  async configureSyncSettings() {
    const config = configManager.loadConfig();

    const { autoSync } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'autoSync',
        message: 'Enable automatic synchronization?',
        default: true
      }
    ]);

    config.autoSync = autoSync;
    configManager.saveConfig(config);

    if (autoSync) {
      console.log(chalk.green('✓ Auto-sync enabled'));
    } else {
      console.log(chalk.green('✓ Auto-sync disabled (use "pullgit sync" to sync manually)'));
    }
  }
}

module.exports = new SetupWizard();
