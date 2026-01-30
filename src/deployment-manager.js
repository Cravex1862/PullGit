const fs = require('fs');
const path = require('path');

const DEPLOYMENTS = {
  nodejs_nginx: {
    name: 'Node.js + Nginx',
    description: 'Node.js application served by Nginx reverse proxy',
    requirements: ['Node.js', 'npm', 'Nginx'],
    setupScript: 'nodejs-nginx-setup.sh',
    restartScript: 'nodejs-nginx-restart.sh',
    config: {
      port: 3000,
      processManager: 'pm2'
    }
  },
  static_apache: {
    name: 'Static Site + Apache',
    description: 'HTML/CSS/JS served by Apache HTTP Server',
    requirements: ['Apache2'],
    setupScript: 'static-apache-setup.sh',
    restartScript: 'static-apache-restart.sh',
    config: {
      documentRoot: '/var/www/html'
    }
  },
  nodejs_pm2: {
    name: 'Node.js + PM2',
    description: 'Node.js application with PM2 process manager',
    requirements: ['Node.js', 'npm', 'PM2'],
    setupScript: 'nodejs-pm2-setup.sh',
    restartScript: 'nodejs-pm2-restart.sh',
    config: {
      port: 3000,
      instances: 'max'
    }
  },
  python_flask: {
    name: 'Python Flask + Nginx',
    description: 'Python Flask application with Nginx and Gunicorn',
    requirements: ['Python3', 'pip3', 'Nginx', 'Gunicorn'],
    setupScript: 'python-flask-setup.sh',
    restartScript: 'python-flask-restart.sh',
    config: {
      port: 5000,
      workers: 4
    }
  },
  static_nginx: {
    name: 'Static Site + Nginx',
    description: 'HTML/CSS/JS served by Nginx',
    requirements: ['Nginx'],
    setupScript: 'static-nginx-setup.sh',
    restartScript: 'static-nginx-restart.sh',
    config: {
      port: 80
    }
  }
};

class DeploymentManager {
  getDeploymentTypes() {
    return Object.entries(DEPLOYMENTS).map(([key, value]) => ({
      id: key,
      ...value
    }));
  }

  getDeployment(typeId) {
    return DEPLOYMENTS[typeId] ? { id: typeId, ...DEPLOYMENTS[typeId] } : null;
  }

  validateDeploymentType(typeId) {
    return typeId in DEPLOYMENTS;
  }

  getSetupScript(typeId) {
    const deployment = DEPLOYMENTS[typeId];
    if (!deployment) return null;

    const scriptPath = path.join(__dirname, '..', 'deployments', deployment.setupScript);
    if (fs.existsSync(scriptPath)) {
      return fs.readFileSync(scriptPath, 'utf-8');
    }
    return null;
  }

  getRestartScript(typeId) {
    const deployment = DEPLOYMENTS[typeId];
    if (!deployment) return null;

    const scriptPath = path.join(__dirname, '..', 'deployments', deployment.restartScript);
    if (fs.existsSync(scriptPath)) {
      return fs.readFileSync(scriptPath, 'utf-8');
    }
    return null;
  }

  getDeploymentConfig(typeId) {
    const deployment = DEPLOYMENTS[typeId];
    return deployment ? deployment.config : null;
  }
}

module.exports = new DeploymentManager();
