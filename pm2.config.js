module.exports = {
  apps: [{
    name: 'delegation-tracker',
    script: 'npm',
    args: 'start:production',
    cwd: '/home/platne/brasserwis/public_html/brasserwis/tracker',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/platne/brasserwis/logs/delegation-tracker-error.log',
    out_file: '/home/platne/brasserwis/logs/delegation-tracker-out.log',
    log_file: '/home/platne/brasserwis/logs/delegation-tracker-combined.log',
    time: true
  }]
}
