module.exports = {
  apps: [
    {
      name: 'quiz-bank',
      script: 'dist/server.js',
      env: {
        NODE_ENV: 'development',
      },
      env_qa: {
        NODE_ENV: 'qa',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
