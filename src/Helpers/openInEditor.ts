import { exec } from 'child_process';
import chalk = require('chalk');

export function openInEditor(filePaths: string[]) {
  const editor = process.env.EDITOR || 'code'; // По умолчанию VS Code, но можно использовать другой редактор
  
  exec(`${editor} ${filePaths.join(' ')}`, (error) => {
    if (error) {
      console.error(chalk.yellow(`⚠️ Could not open files in editor: ${error.message}`));
    }
  });
}