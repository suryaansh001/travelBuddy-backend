// PM2 Ecosystem configuration for production deployment
module.exports = {
  apps: [{
    name: 'campusbuddy-backend',
    script: './dist/index.js',
    instances: 'max', // Use all available CPUs
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 3000,
    kill_timeout: 5000,
    wait_ready: true,
  }]
};
