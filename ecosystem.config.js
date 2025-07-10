module.exports = {
  apps: [
    {
      name: 'lightin-up-utah',
      script: 'server-enhanced.js',
      instances: 'max', // Use all CPU cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        WORKERS: 4,
        MEMORY_THRESHOLD: 400,
        MAX_MEMORY_PER_WORKER: 512,
        ENABLE_COMPRESSION: 'true',
        ENABLE_MONITORING: 'true',
        MONITORING_INTERVAL: 30000,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
        WORKERS: process.env.WORKERS || 4,
        MEMORY_THRESHOLD: process.env.MEMORY_THRESHOLD || 400,
        MAX_MEMORY_PER_WORKER: process.env.MAX_MEMORY_PER_WORKER || 512,
        ENABLE_COMPRESSION: 'true',
        ENABLE_MONITORING: 'true',
        MONITORING_INTERVAL: 30000,
        HOST: '0.0.0.0'
      },
      // Memory and restart settings
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'build'],
      
      // Performance
      node_args: '--max-old-space-size=512',
      
      // Health check
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true
    }
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/lightinuputah.git',
      path: '/var/www/lightin-up-utah',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 