const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const componentsDir = './components';
const allComponents = execSync(`find ${componentsDir} -type f \\( -name "*.tsx" -o -name "*.ts" \\)`).toString().split('\n').filter(Boolean);

const unused = [];

allComponents.forEach(comp => {
  const baseName = path.basename(comp, path.extname(comp));
  const dirName = path.basename(path.dirname(comp));
  // Search for imports of this component
  // Typically imported as something like from '@/components/.../baseName' or './baseName'
  // Let's just search for the basename in the whole project, excluding the file itself
  try {
    const result = execSync(`rg -l "${baseName}" ./app ./components ./lib ./services ./hooks`, { stdio: 'pipe' }).toString().split('\n').filter(Boolean);
    const references = result.filter(r => path.resolve(r) !== path.resolve(comp));
    if (references.length === 0) {
      unused.push(comp);
    }
  } catch (e) {
    // ripgrep exits with 1 if no matches found
    if (e.status === 1) {
      unused.push(comp);
    }
  }
});

console.log('Potentially unused components:');
console.log(unused.join('\n'));
