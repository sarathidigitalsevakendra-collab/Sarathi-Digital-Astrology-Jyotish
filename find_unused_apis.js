const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const apiDir = './app/api';
const allApis = execSync(`find ${apiDir} -type f -name "route.ts"`).toString().split('\n').filter(Boolean);

const unused = [];

allApis.forEach(api => {
  const routePath = path.dirname(api).replace('./app', ''); // e.g. /api/health
  try {
    const result = execSync(`rg -l "${routePath}" ./app ./components ./lib ./services ./hooks`, { stdio: 'pipe' }).toString().split('\n').filter(Boolean);
    const references = result.filter(r => path.resolve(r) !== path.resolve(api));
    if (references.length === 0) {
      unused.push(routePath);
    }
  } catch (e) {
    if (e.status === 1) {
      unused.push(routePath);
    }
  }
});

console.log('Potentially unused APIs:');
console.log(unused.join('\n'));
