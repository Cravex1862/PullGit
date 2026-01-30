const { Octokit } = require('octokit');
const configManager = require('./config-manager');
const chalk = require('chalk');
const axios = require('axios');

class GithubAuth {
  async validateToken(token) {
    try {
      const octokit = new Octokit({ auth: token });
      const { data } = await octokit.rest.users.getAuthenticated();
      return { valid: true, user: data.login };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  async checkRepositoryAccess(repoUrl, token) {
    try {
      // Extract owner and repo from URL
      const match = repoUrl.match(/github\.com[/:]([\w-]+)\/([\w.-]+?)(?:\.git)?$/i);
      if (!match) {
        return { accessible: false, error: 'Invalid GitHub URL format' };
      }

      const [, owner, repo] = match;
      
      const octokit = new Octokit({ auth: token });
      const { data } = await octokit.rest.repos.get({ owner, repo });
      
      return { 
        accessible: true, 
        isPrivate: data.private,
        defaultBranch: data.default_branch,
        description: data.description
      };
    } catch (error) {
      return { accessible: false, error: error.message };
    }
  }

  async getRepositoryInfo(repoUrl, token = null) {
    try {
      const match = repoUrl.match(/github\.com[/:]([\w-]+)\/([\w.-]+?)(?:\.git)?$/i);
      if (!match) {
        throw new Error('Invalid GitHub URL format');
      }

      const [, owner, repo] = match;
      
      let octokit;
      if (token) {
        octokit = new Octokit({ auth: token });
      } else {
        octokit = new Octokit();
      }

      const { data } = await octokit.rest.repos.get({ owner, repo });
      
      return {
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        isPrivate: data.private,
        defaultBranch: data.default_branch,
        cloneUrl: data.clone_url,
        sshUrl: data.ssh_url,
        lastPush: data.pushed_at
      };
    } catch (error) {
      throw new Error(`Failed to get repository info: ${error.message}`);
    }
  }

  storeToken(token) {
    configManager.setGithubToken(token);
  }

  getStoredToken() {
    return configManager.getGithubToken();
  }

  clearToken() {
    configManager.setGithubToken(null);
  }
}

module.exports = new GithubAuth();
