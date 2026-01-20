module.exports = {
  apps: [
    {
      name: 'cognitoflow-web',
      script: 'npm',
      args: 'run start',
      cwd: './apps/web',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'cognitoflow-backend',
      script: 'node',
      args: 'dist/index.js',
      cwd: './packages/backend',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
