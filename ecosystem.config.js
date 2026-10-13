module.exports = {
  apps: [
    {
      name: 'admins-service',
      cwd: './',
      script: 'node',
      args: 'dist/apps/admin-service/src/main.js',
      watch: false,
      env: {
        NODE_ENV: 'production',
        ADMIN_PORT: 3003,
      },
    },
    {
      name: 'user-service',
      cwd: './',
      script: 'node',
      args: 'dist/apps/user-service/src/main.js',
      watch: false,
      env: {
        NODE_ENV: 'production',
        USER_PORT: 3004,
      },
    },
    {
      name: 'auth-service',
      cwd: './',
      script: 'node',
      args: 'dist/apps/auth-service/src/main.js',
      watch: false,
      env: {
        NODE_ENV: 'production',
        AUTH_PORT: 3005,
      },
    },
    {
      name: 'api-gateway',
      cwd: './',
      script: 'node',
      args: 'dist/api-gateway/src/main.js',
      watch: false,
      env: {
        NODE_ENV: 'production',
        COMMON_PORT: 3002,
        ADMIN_PORT: 3003,
        USER_PORT: 3004,
        AUTH_PORT: 3005
      },
    },
  ],
};