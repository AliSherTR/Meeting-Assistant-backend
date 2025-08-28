module.exports = {
  apps: [
    {
      name: "backend-template",
      script: "dist/server.js",
      instances: "max",
      exec_mode: "cluster",
      env: { NODE_ENV: "development" },
      env_production: { NODE_ENV: "production" },
      max_restarts: 10,
      watch: false,
      merge_logs: true,
      time: true,
    },
  ],
};
