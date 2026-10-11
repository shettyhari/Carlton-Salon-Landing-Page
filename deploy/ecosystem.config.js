// PM2 process file: keeps the backend running and restarts it after crashes or reboots.
// On the server, from the backend folder:
//   pm2 start ecosystem.config.js && pm2 save && pm2 startup
module.exports = {
  apps: [
    {
      name: "carlton-landing-backend",
      script: "src/server.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
