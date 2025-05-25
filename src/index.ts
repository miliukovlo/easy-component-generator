import chalk = require('chalk');
import fs = require('fs-extra');
import path = require('path');
import inquirer = require('inquirer');
import { updateParentIndex } from './Helpers/updateParentIndex';
import { capitalizeFirstLetter } from './Helpers/capitalizeFirstLetter';
import { openInEditor } from './Helpers/openInEditor';
import { getFiles } from './Helpers/getFiles';
import { getBaseDir } from './Helpers/getBaseDir';

async function init() {
    console.log(chalk.blue('🛠 Components generator'));
    let customDir;
    let needStoryBook;
  
    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: 'What need to create?',
      choices: ['Component', 'Block', 'UI', 'Type', 'Hook', 'Other'],
    });

    if (type === 'Component' || type === 'Block' || type === 'UI') {
      const { need } = await inquirer.prompt({
        type: 'input',
        name: 'need',
        message: `Need storybook? (Y/N):`,
        validate: (input: string) => {
          if (input === '') return 'false';
          return true;
        },
      });
      needStoryBook = need === "Y" || need === "y" || need === "yes" || need === "Yes"
    }

    if (type === 'Other') {
      const { dir } = await inquirer.prompt({
        type: 'input',
        name: 'dir',
        message: `Write specific dir:`,
        validate: (input: string) => {
          if (!input.trim()) return 'Dir can`t be empty!';
          return true;
        },
      });
      customDir = dir
    }
  
    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: `Write title of ${type === 'Component' ? 'component' :
          type === 'Block' ? 'block' :
          type === 'UI' ? 'UI-element' :
          type === 'Type' ? 'type' : 
          type === 'Hook' ? 'hook' : 
          'file'}`,
      validate: (input: string) => {
        if (!input.trim()) return 'Title can`t be empty!';
        return true;
      },
      filter: (input: string) => type === 'Hook' && input.startsWith('use') ? input : capitalizeFirstLetter(input),
    });
  
    const baseDir = getBaseDir(type, customDir)

    const componentDir = path.join(baseDir, type === 'Type' ? name.replace(/(Types?)$/, '') :
      type === 'Hook' ? `${name.startsWith('use') ? '' : 'use'}${name}` :
      name);
    
    try {
      await fs.ensureDir(componentDir);
  
      const files = getFiles(type, name, needStoryBook)

      const createdFiles: string[] = [];
  
      for (const file of files) {
        const filePath = path.join(componentDir, file.name);
        await fs.writeFile(filePath, file.content);
        createdFiles.push(filePath);
        console.log(chalk.green(`✅ File ${file.name} was created!`));
      }
      const filesToOpen = createdFiles.filter(file => !file.endsWith('index.ts'));
      openInEditor(filesToOpen);
      console.log(chalk.bold(`🎉 ${type} "${name}" was generated!`));
    } catch (error) {
      console.error(chalk.red('❌ Error of created:'), error);
    }

    await updateParentIndex(baseDir, type);
}

init();