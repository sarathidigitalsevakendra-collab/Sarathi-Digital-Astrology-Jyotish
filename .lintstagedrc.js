module.exports = {
  '*.{ts,tsx}': (filenames) => {
    const nonDtsFiles = filenames.filter(file => !file.endsWith('.d.ts'));
    const commands = [];

    // Prettier for all TypeScript files (including .d.ts)
    commands.push(`prettier --write ${filenames.join(' ')}`);

    // ESLint only for non-.d.ts files
    if (nonDtsFiles.length > 0) {
      commands.push(`eslint --fix ${nonDtsFiles.join(' ')}`);
    }

    return commands;
  },
  '*.{json,md,yml,yaml}': 'prettier --write',
};
