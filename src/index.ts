import chalk = require('chalk');
import fs = require('fs-extra');
import path = require('path');
import inquirer = require('inquirer');

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function init() {
    console.log(chalk.blue('🛠 Components generator'));
  
    const { type } = await inquirer.prompt({
      type: 'list',
      name: 'type',
      message: 'What need to create?',
      choices: ['Component', 'Block', 'UI'],
    });
  
    const { name } = await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: `Write title of ${type === 'Component' ? 'component' : type === 'Block' ? 'block' : 'UI-element'}:`,
      validate: (input: string) => {
        if (!input.trim()) return 'Title can`t be empty!';
        return true;
      },
      filter: (input: string) => capitalizeFirstLetter(input),
    });
  
    const baseDir = type === 'Component' ? 'src/components' : type === 'Block' ? 'src/blocks' : 'src/UI';
    const componentDir = path.join(baseDir, name);
    
    try {
      await fs.ensureDir(componentDir);
  
      const files = [
        { name: `${name}.tsx`, content: getComponentTemplate(name) },
        { name: `${name}Types.ts`, content: getTypesTemplate(name) },
        { name: 'index.ts', content: `export * from './${name}';\n` },
      ];
  
      for (const file of files) {
        const filePath = path.join(componentDir, file.name);
        await fs.writeFile(filePath, file.content);
        console.log(chalk.green(`✅ File ${file.name} was created!`));
      }
  
      console.log(chalk.bold(`🎉 ${type} "${name}" was generated!`));
    } catch (error) {
      console.error(chalk.red('❌ Error of created:'), error);
    }

    await updateParentIndex(baseDir);
}

function getComponentTemplate(name: string) {
  return `import React from 'react';
import { ${name}Props } from './${name}Types';

export const ${name} = (props: ${name}Props) => {
  return (
    <div>${name} component</div>
  );
};
`;
}

function getTypesTemplate(name: string) {
  return `export interface ${name}Props {
  // Props
};
`;
}

async function updateParentIndex(parentDir: string) {
    const indexPath = path.join(parentDir, 'index.ts');
    
    try {
        const items = await fs.readdir(parentDir, { withFileTypes: true });
        const components = items
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        const content = components
            .map(component => `export { ${component} } from './${component}';`)
            .join('\n') + '\n';

        await fs.writeFile(indexPath, content);
        console.log(chalk.green(`✅ Parent index.ts updated!`));
    } catch (error) {
        if (error instanceof Error && 'code' in error) {
            const nodeError = error as NodeJS.ErrnoException;
            if (nodeError.code === 'ENOENT') {
                await fs.ensureDir(parentDir);
                await fs.writeFile(indexPath, '');
                return updateParentIndex(parentDir);
            }
        }
        throw error;
    }
}

init();