const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const configManager = require('./config-manager');
const githubAuth = require('./github-auth');
const chalk = require('chalk');
const ora = require('ora');

class SyncEngine {
  async cloneRepository(repoUrl, repoName, isPrivate = false) {
    const reposDir = configManager.getReposDir();
    const targetPath = path.join(reposDir, repoName);

    // Check if already exists
    if (fs.existsSync(targetPath)) {
      throw new Error(`Repository directory already exists at ${targetPath}`);
    }

    const spinner = ora(`Cloning repository...`).start();

    try {
      let cloneUrl = repoUrl;

      // If private, we might need authentication
      if (isPrivate) {
        const token = configManager.getGithubToken();
        if (token) {
          // Format URL with token for HTTPS cloning
          cloneUrl = repoUrl.replace('https://', `https://x-access-token:${token}@`);
        }
      }

      const git = simpleGit();
      await git.clone(cloneUrl, targetPath);

      spinner.succeed(`Repository cloned to ${targetPath}`);
      return { success: true, path: targetPath };
    } catch (error) {
      spinner.fail(`Failed to clone repository`);
      throw new Error(`Clone failed: ${error.message}`);
    }
  }

  async pullRepository(repoName) {
    const reposDir = configManager.getReposDir();
    const repoPath = path.join(reposDir, repoName);

    if (!fs.existsSync(repoPath)) {
      throw new Error(`Repository not found at ${repoPath}`);
    }

    const spinner = ora(`Pulling latest changes...`).start();

    try {
      const git = simpleGit(repoPath);
      await git.pull();
      
      spinner.succeed(`Repository updated successfully`);
      return { success: true, message: 'Repository updated' };
    } catch (error) {
      spinner.fail(`Failed to pull repository`);
      throw new Error(`Pull failed: ${error.message}`);
    }
  }

  async getRepositoryStatus(repoName) {
    const reposDir = configManager.getReposDir();
    const repoPath = path.join(reposDir, repoName);

    if (!fs.existsSync(repoPath)) {
      throw new Error(`Repository not found at ${repoPath}`);
    }

    try {
      const git = simpleGit(repoPath);
      const status = await git.status();
      const log = await git.log(['-1']);
      
      return {
        path: repoPath,
        branch: status.current,
        dirty: !status.isClean(),
        lastCommit: log.latest,
        files: {
          modified: status.modified.length,
          created: status.created.length,
          deleted: status.deleted.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to get status: ${error.message}`);
    }
  }

  async checkForUpdates(repoUrl) {
    try {
      const repoInfo = await githubAuth.getRepositoryInfo(repoUrl);
      return {
        lastPush: repoInfo.lastPush,
        branch: repoInfo.defaultBranch
      };
    } catch (error) {
      throw new Error(`Failed to check for updates: ${error.message}`);
    }
  }

  getRepositoryPath(repoName) {
    return path.join(configManager.getReposDir(), repoName);
  }
}

module.exports = new SyncEngine();
