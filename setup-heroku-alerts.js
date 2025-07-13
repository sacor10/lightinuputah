#!/usr/bin/env node

/**
 * Heroku Performance Alerts Setup Script
 * 
 * This script helps configure Papertrail alerts for performance monitoring
 * on your Heroku app. It uses the Papertrail API to create alerts that will
 * send emails to your primary Heroku email.
 * 
 * Usage: node setup-heroku-alerts.js
 */

const https = require('https');
const readline = require('readline');

// Configuration
const CONFIG = {
  appName: 'lightinuputah',
  primaryEmail: 'sacor10@gmail.com',
  papertrailToken: process.env.PAPERTRAIL_API_TOKEN,
  alerts: [
    {
      name: 'Poor LCP Performance',
      query: '[PERFORMANCE-ALERT] LCP is poor',
      threshold: 1,
      timeWindow: 300, // 5 minutes
      cooldown: 900, // 15 minutes
      severity: 'critical'
    },
    {
      name: 'Poor FCP Performance',
      query: '[PERFORMANCE-ALERT] FCP is poor',
      threshold: 1,
      timeWindow: 300,
      cooldown: 900,
      severity: 'critical'
    },
    {
      name: 'Poor CLS Performance',
      query: '[PERFORMANCE-ALERT] CLS is poor',
      threshold: 1,
      timeWindow: 300,
      cooldown: 900,
      severity: 'critical'
    },
    {
      name: 'Poor FID Performance',
      query: '[PERFORMANCE-ALERT] FID is poor',
      threshold: 1,
      timeWindow: 300,
      cooldown: 900,
      severity: 'critical'
    },
    {
      name: 'JavaScript Errors',
      query: 'JavaScript_Error',
      threshold: 3,
      timeWindow: 600, // 10 minutes
      cooldown: 1800, // 30 minutes
      severity: 'warning'
    },
    {
      name: 'Unhandled Promise Rejections',
      query: 'unhandledrejection',
      threshold: 1,
      timeWindow: 300,
      cooldown: 900,
      severity: 'critical'
    },
    {
      name: 'Slow Resource Loading',
      query: 'Resource_Load_Time AND "status":"poor"',
      threshold: 5,
      timeWindow: 600,
      cooldown: 1200, // 20 minutes
      severity: 'warning'
    },
    {
      name: 'High Memory Usage',
      query: '"usedJSHeapSize":8[0-9][0-9] OR "usedJSHeapSize":9[0-9][0-9]',
      threshold: 3,
      timeWindow: 300,
      cooldown: 900,
      severity: 'warning'
    }
  ]
};

// Papertrail API functions
class PapertrailAPI {
  constructor(token) {
    this.token = token;
    this.baseURL = 'https://papertrailapp.com/api/v1';
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'papertrailapp.com',
        path: `/api/v1${endpoint}`,
        method: method,
        headers: {
          'X-Papertrail-Token': this.token,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        const postData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            resolve(response);
          } catch (error) {
            resolve(body);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  async getSystems() {
    return this.makeRequest('/systems.json');
  }

  async createAlert(alertConfig) {
    const alertData = {
      alert: {
        name: alertConfig.name,
        query: alertConfig.query,
        conditions: {
          threshold: alertConfig.threshold,
          time_window: alertConfig.timeWindow
        },
        cooldown: alertConfig.cooldown,
        notifications: {
          email: [CONFIG.primaryEmail]
        }
      }
    };

    return this.makeRequest('/alerts.json', 'POST', alertData);
  }

  async getAlerts() {
    return this.makeRequest('/alerts.json');
  }

  async deleteAlert(alertId) {
    return this.makeRequest(`/alerts/${alertId}.json`, 'DELETE');
  }
}

// CLI interface
class AlertSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  async setup() {
    console.log('🚨 Heroku Performance Alerts Setup\n');
    console.log(`App: ${CONFIG.appName}`);
    console.log(`Primary Email: ${CONFIG.primaryEmail}\n`);

    if (!CONFIG.papertrailToken) {
      console.log('❌ PAPERTRAIL_API_TOKEN environment variable not found.');
      console.log('Please run: heroku config:get PAPERTRAIL_API_TOKEN');
      process.exit(1);
    }

    const api = new PapertrailAPI(CONFIG.papertrailToken);

    try {
      // Check existing alerts
      console.log('📋 Checking existing alerts...');
      const existingAlerts = await api.getAlerts();
      console.log(`Found ${existingAlerts.length} existing alerts\n`);

      // Show alert configuration
      console.log('🎯 Alert Configuration:');
      CONFIG.alerts.forEach((alert, index) => {
        console.log(`${index + 1}. ${alert.name}`);
        console.log(`   Query: ${alert.query}`);
        console.log(`   Threshold: ${alert.threshold} occurrence(s) in ${alert.timeWindow / 60} minute(s)`);
        console.log(`   Cooldown: ${alert.cooldown / 60} minute(s)`);
        console.log(`   Severity: ${alert.severity}`);
        console.log(`   Email: ${CONFIG.primaryEmail}\n`);
      });

      const proceed = await this.question('Do you want to proceed with creating these alerts? (y/N): ');
      if (proceed.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        process.exit(0);
      }

      // Create alerts
      console.log('\n🚀 Creating alerts...');
      for (const alert of CONFIG.alerts) {
        try {
          console.log(`Creating alert: ${alert.name}`);
          const result = await api.createAlert(alert);
          console.log(`✅ Created alert: ${alert.name} (ID: ${result.id})`);
        } catch (error) {
          console.log(`❌ Failed to create alert: ${alert.name}`);
          console.log(`   Error: ${error.message}`);
        }
      }

      // Verify alerts
      console.log('\n📊 Verifying alerts...');
      const finalAlerts = await api.getAlerts();
      console.log(`Total alerts: ${finalAlerts.length}`);

      console.log('\n✅ Alert setup complete!');
      console.log('\n📧 You will receive email notifications at:');
      console.log(`   ${CONFIG.primaryEmail}`);
      console.log('\n🔍 To view alerts in Papertrail:');
      console.log(`   heroku addons:open papertrail --app ${CONFIG.appName}`);
      console.log('\n📋 To test alerts:');
      console.log(`   heroku logs --tail --app ${CONFIG.appName} | grep "PERFORMANCE-ALERT"`);

    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new AlertSetup();
  setup.setup().catch(console.error);
}

module.exports = { PapertrailAPI, AlertSetup, CONFIG }; 