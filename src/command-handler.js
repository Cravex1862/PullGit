const inquirer = require('inquirer');
const chalk = require('chalk');
const configManager = require('./config-manager');
const syncEngine = require('./sync-engine');
const setupWizard = require('./setup-wizard');
const deploymentManager = require('./deployment-manager');
const githubAuth = require('./github-auth');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CommandHandler {
  async handleCommand(args) {
    const command = args[0];
    const params = args.slice(1);

    switch (command) {
      case 'help':
        this.showHelp();
        break;
      case 'list':
        this.listRepositories();
        break;
      case 'sync':
        await this.syncRepositories(params);
        break;
      case 'add':
        await this.addRepository();
        break;
      case 'remove':
        await this.removeRepository();
        break;
      case 'status':
        await this.showStatus();
        break;
      case 'setup':
        await setupWizard.run();
        break;
      case 'deploy':
        await this.deployRepository(params);
        break;
      case 'config':
        this.showConfig();
        break;
      default:
        console.log(chalk.red(`Unknown command: ${command}`));
        console.log(chalk.white('Run "pullgit help" for available commands'));
    }
  }

  async showMenu() {
    const { command } = await inquirer.prompt([
      {
        type: 'list',
        name: 'command',
        message: 'What would you like to do?',
        choices: [
          { name: 'List repositories', value: 'list' },
          { name: 'Sync repositories', value: 'sync' },
          { name: 'Add repository', value: 'add' },
          { name: 'Remove repository', value: 'remove' },
          { name: 'View status', value: 'status' },
          { name: 'Deploy repository', value: 'deploy' },
          { name: 'Run setup wizard', value: 'setup' },
          { name: 'Show configuration', value: 'config' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);

    if (command === 'exit') {
      console.log(chalk.cyan('\nGoodbye! 👋\n'));
      return;
    }

    await this.handleCommand([command]);
  }

  showHelp() {
    console.log(chalk.cyan.bold('\n📚 PullGit Commands\n'));
    console.log(chalk.white('Setup & Configuration:'));
    console.log(chalk.gray('  pullgit setup           Start the setup wizard'));
    console.log(chalk.gray('  pullgit add             Add a new repository'));
    console.log(chalk.gray('  pullgit remove          Remove a repository'));
    console.log(chalk.gray('  pullgit config          Show current configuration\n'));
    
    console.log(chalk.white('Repository Management:'));
    console.log(chalk.gray('  pullgit list            List all repositories'));
    console.log(chalk.gray('  pullgit sync            Manually sync all repositories'));
    console.log(chalk.gray('  pullgit sync [name]     Sync specific repository'));
    console.log(chalk.gray('  pullgit status          Show sync status\n'));
    
    console.log(chalk.white('Deployment:'));
    console.log(chalk.gray('  pullgit deploy [name]   Deploy a repository'));
    console.log(chalk.gray('  pullgit help            Show this help message\n'));
  }

  listRepositories() {
    const repos = configManager.getRepositories();
    
    if (repos.length === 0) {
      console.log(chalk.yellow('\nNo repositories configured. Run "pullgit add" to add one.\n'));
      return;
    }

    console.log(chalk.cyan.bold('\n📦 Your Repositories\n'));
    
    repos.forEach((repo, index) => {
      const isPrivate = repo.isPrivate ? chalk.red('🔒 Private') : chalk.green('🔓 Public');
      const syncStatus = repo.autoSync ? chalk.green('✓ Auto-sync') : chalk.gray('⊘ Manual');
      
      console.log(chalk.white(`${index + 1}. ${repo.fullName}`));
      console.log(chalk.gray(`   URL: ${repo.url}`));
      console.log(chalk.gray(`   Type: ${repo.deploymentType} | ${isPrivate} | ${syncStatus}`));
      if (repo.lastSync) {
        console.log(chalk.gray(`   Last sync: ${new Date(repo.lastSync).toLocaleString()}`));
      }
      console.log();
    });
  }

  async syncRepositories(params) {
    const repos = configManager.getRepositories();
    
    if (repos.length === 0) {
      console.log(chalk.yellow('\nNo repositories configured.\n'));
      return;
    }

    let reposToSync = repos;
    
    // If specific repo name provided
    if (params.length > 0) {
      const repoName = params[0];
      reposToSync = repos.filter(r => r.name.toLowerCase() === repoName.toLowerCase() || r.fullName.toLowerCase() === repoName.toLowerCase());
      
      if (reposToSync.length === 0) {
        console.log(chalk.red(`\nRepository "${repoName}" not found.\n`));
        return;
      }
    }

    console.log(chalk.cyan(`\n🔄 Starting sync of ${reposToSync.length} repository(ies)...\n`));

    for (const repo of reposToSync) {
      try {
        const repoPath = syncEngine.getRepositoryPath(repo.name);
        
        if (!fs.existsSync(repoPath)) {
          // Clone if doesn't exist
          console.log(chalk.cyan(`→ Cloning ${repo.fullName}...`));
          await syncEngine.cloneRepository(repo.url, repo.name, repo.isPrivate);
        } else {
          // Pull if exists
          console.log(chalk.cyan(`→ Updating ${repo.fullName}...`));
          await syncEngine.pullRepository(repo.name);
        }

        // Update last sync time
        configManager.updateRepository(repo.url, {
          lastSync: new Date().toISOString()
        });

      } catch (error) {
        console.error(chalk.red(`✗ Error syncing ${repo.fullName}: ${error.message}`));
      }
    }

    console.log(chalk.green('\n✅ Sync completed!\n'));
  }

  async addRepository() {
    try {
      await setupWizard.setupRepositories();
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  }

  async removeRepository() {
    const repos = configManager.getRepositories();
    
    if (repos.length === 0) {
      console.log(chalk.yellow('\nNo repositories to remove.\n'));
      return;
    }

    const { repoUrl } = await inquirer.prompt([
      {
        type: 'list',
        name: 'repoUrl',
        message: 'Which repository to remove?',
        choices: repos.map(r => ({
          name: r.fullName,
          value: r.url
        }))
      }
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure? (Local files will NOT be deleted)',
        default: false
      }
    ]);

    if (confirm) {
      configManager.removeRepository(repoUrl);
      console.log(chalk.green('\n✓ Repository removed from configuration\n'));
    }
  }

  async showStatus() {
    const repos = configManager.getRepositories();
    
    if (repos.length === 0) {
      console.log(chalk.yellow('\nNo repositories configured.\n'));
      return;
    }

    console.log(chalk.cyan.bold('\n📊 Repository Status\n'));

    for (const repo of repos) {
      try {
        const repoPath = syncEngine.getRepositoryPath(repo.name);
        
        if (!fs.existsSync(repoPath)) {
          console.log(chalk.white(`${repo.fullName}`));
          console.log(chalk.gray(`  Status: Not cloned yet`));
        } else {
          const status = await syncEngine.getRepositoryStatus(repo.name);
          console.log(chalk.white(`${repo.fullName}`));
          console.log(chalk.gray(`  Location: ${status.path}`));
          console.log(chalk.gray(`  Branch: ${status.branch}`));
          console.log(chalk.gray(`  Status: ${status.dirty ? chalk.yellow('Modified') : chalk.green('Clean')}`));
          console.log(chalk.gray(`  Last commit: ${status.lastCommit?.message || 'N/A'}`));
        }
        console.log();
      } catch (error) {
        console.error(chalk.red(`✗ Error getting status for ${repo.fullName}: ${error.message}`));
      }
    }
  }

  async deployRepository(params) {
    const repos = configManager.getRepositories();
    
    if (repos.length === 0) {
      console.log(chalk.yellow('\nNo repositories configured.\n'));
      return;
    }

    let targetRepo;
    
    if (params.length > 0) {
      const repoName = params[0];
      targetRepo = repos.find(r => r.name.toLowerCase() === repoName.toLowerCase() || r.fullName.toLowerCase() === repoName.toLowerCase());
      
      if (!targetRepo) {
        console.log(chalk.red(`\nRepository "${repoName}" not found.\n`));
        return;
      }
    } else {
      const { repoUrl } = await inquirer.prompt([
        {
          type: 'list',
          name: 'repoUrl',
          message: 'Which repository to deploy?',
          choices: repos.map(r => ({
            name: r.fullName,
            value: r.url
          }))
        }
      ]);
      
      targetRepo = repos.find(r => r.url === repoUrl);
    }

    const deployment = deploymentManager.getDeployment(targetRepo.deploymentType);
    const repoPath = syncEngine.getRepositoryPath(targetRepo.name);

    console.log(chalk.cyan.bold(`\n🚀 Deploying ${targetRepo.fullName}\n`));
    console.log(chalk.white(`Deployment Type: ${deployment.name}`));
    console.log(chalk.white(`Repository Path: ${repoPath}`));
    console.log(chalk.white(`Requirements: ${deployment.requirements.join(', ')}\n`));

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Continue with deployment?',
        default: false
      }
    ]);

    if (!confirm) {
      console.log(chalk.yellow('\nDeployment cancelled.\n'));
      return;
    }

    try {
      const setupScript = deploymentManager.getSetupScript(targetRepo.deploymentType);
      
      if (setupScript) {
        console.log(chalk.cyan('\nSetup script for your VPS:\n'));
        console.log(chalk.gray('─'.repeat(50)));
        console.log(setupScript);
        console.log(chalk.gray('─'.repeat(50)));
        console.log(chalk.yellow('\nRun the above script on your VPS with:'));
        console.log(chalk.white(`bash script.sh ${targetRepo.name} ${repoPath}\n`));
      } else {
        console.log(chalk.yellow('\nNo setup script available for this deployment type.\n'));
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  }

  showConfig() {
    const config = configManager.loadConfig();
    const token = configManager.getGithubToken();
    
    console.log(chalk.cyan.bold('\n⚙️  Configuration\n'));
    console.log(chalk.white('GitHub Token: ' + (token ? chalk.green('Set') : chalk.gray('Not set'))));
    console.log(chalk.white(`Auto-sync: ${config.autoSync ? chalk.green('Enabled') : chalk.gray('Disabled')}`));
    console.log(chalk.white(`Repositories: ${config.repositories.length}`));
    console.log(chalk.white(`Config Directory: ${configManager.getConfigDir()}\n`));
  }
}

module.exports = new CommandHandler();
