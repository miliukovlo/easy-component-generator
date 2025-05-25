#!/usr/bin/env node
import chalk = require('chalk');
import fs = require('fs-extra');
import path = require('path');
import inquirer = require('inquirer');
import { Command } from 'commander';
import { updateParentIndex } from './Helpers/updateParentIndex';
import { capitalizeFirstLetter } from './Helpers/capitalizeFirstLetter';
import { openInEditor } from './Helpers/openInEditor';
import { getFiles } from './Helpers/getFiles';
import { getBaseDir } from './Helpers/getBaseDir';

interface GeneratorOptions {
    type?: string;
    name?: string;
    dir?: string;
    skipStorybook?: boolean;
}

async function init(options: GeneratorOptions = {}) {
    console.log(chalk.blue('🛠 Components generator'));
    let { type, name, dir: customDir, skipStorybook } = options;

    // Если параметры не переданы через флаги, запрашиваем интерактивно
    if (!type) {
        const answers = await inquirer.prompt({
            type: 'list',
            name: 'type',
            message: 'What need to create?',
            choices: ['Component', 'Block', 'UI', 'Type', 'Hook', 'Other'],
        });
        type = answers.type;
    }

    if (type === 'Other' && !customDir) {
        const answers = await inquirer.prompt({
            type: 'input',
            name: 'dir',
            message: 'Write specific dir:',
            validate: (input: string) => {
                if (!input.trim()) return 'Dir can\'t be empty!';
                return true;
            },
        });
        customDir = answers.dir;
    }

    if (!name) {
        const answers = await inquirer.prompt({
            type: 'input',
            name: 'name',
            message: `Write title of ${type === 'Component' ? 'component' :
                type === 'Block' ? 'block' :
                type === 'UI' ? 'UI-element' :
                type === 'Type' ? 'type' : 
                type === 'Hook' ? 'hook' : 
                'file'}`,
            validate: (input: string) => {
                if (!input.trim()) return 'Title can\'t be empty!';
                return true;
            },
            filter: (input: string) => type === 'Hook' && input.startsWith('use') ? input : capitalizeFirstLetter(input),
        });
        name = answers.name;
    }

    if (type && customDir && name) {
      // Для компонентов предлагаем создать Storybook, если не указан флаг skip
    if (!skipStorybook && ['Component', 'Block', 'UI'].includes(type)) {
      const answers = await inquirer.prompt({
          type: 'confirm',
          name: 'createStorybook',
          message: 'Do you want to create a Storybook file?',
          default: true,
      });
      skipStorybook = !answers.createStorybook;
  }

  const baseDir = getBaseDir(type, customDir);
  const componentDir = path.join(baseDir, type === 'Type' ? name.replace(/(Types?)$/, '') :
      type === 'Hook' ? `${name.startsWith('use') ? '' : 'use'}${name}` :
      name);
  
  try {
      await fs.ensureDir(componentDir);
      const files = getFiles(type, name, skipStorybook);
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
      console.error(chalk.red('❌ Error of creation:'), error);
  }

  await updateParentIndex(baseDir, type);
    }
}

// Настройка CLI с помощью Commander
const program = new Command();

program
    .name('easy-gen')
    .description('CLI for generating React components and other code files')
    .version('1.0.0');

// Общие флаги
program
    .option('-s, --skip-storybook', 'Skip creating Storybook file for components')
    .option('-n, --name <name>', 'Name of the component/file to create')
    .option('-d, --dir <dir>', 'Custom directory for "Other" type');

// Команды для каждого типа
program
    .command('component [name]')
    .description('Generate a new component')
    .action((name, options) => {
        init({
            type: 'Component',
            name,
            skipStorybook: options.parent.skipStorybook,
            dir: options.parent.dir
        });
    });

program
    .command('block [name]')
    .description('Generate a new block')
    .action((name, options) => {
        init({
            type: 'Block',
            name,
            skipStorybook: options.parent.skipStorybook,
            dir: options.parent.dir
        });
    });

program
    .command('ui [name]')
    .description('Generate a new UI component')
    .action((name, options) => {
        init({
            type: 'UI',
            name,
            skipStorybook: options.parent.skipStorybook,
            dir: options.parent.dir
        });
    });

program
    .command('type [name]')
    .description('Generate a new type')
    .action((name, options) => {
        init({
            type: 'Type',
            name,
            dir: options.parent.dir
        });
    });

program
    .command('hook [name]')
    .description('Generate a new hook')
    .action((name, options) => {
        init({
            type: 'Hook',
            name,
            dir: options.parent.dir
        });
    });

program
    .command('other <dir> [name]')
    .description('Generate in custom directory')
    .action((dir, name, options) => {
        init({
            type: 'Other',
            name,
            dir,
            skipStorybook: options.parent.skipStorybook
        });
    });

// Если команда не указана, запускаем интерактивный режим
if (process.argv.length <= 2) {
    init();
} else {
    program.parse(process.argv);
}