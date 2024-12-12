require('dotenv').config({path: '.env.deploy'});

const { DEPLOY_USER, DEPLOY_HOST, DEPLOY_REF, DEPLOY_REPOSITORY, DEPLOY_PATH } = process.env;

module.exports = {
  apps : [{
    name   : "mesto-backend",
    script : "./dist/app.js"
  }],
  deploy: {
    production: {
      user: DEPLOY_USER,
      host: DEPLOY_HOST,
      ref: DEPLOY_REF,
      repo: DEPLOY_REPOSITORY,
      path: DEPLOY_PATH,
      'pre-deploy-local': `scp ./*.env ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}`,
      'post-deploy': 'npm ci && pwd && npm run build && pm2 startOrRestart ecosystem.config.js --env production',
    },
  },
}
