import path = require('path');
import chalk = require('chalk');
import fs = require('fs-extra');

export async function updateParentIndex(parentDir: string, type: string) {
    const indexPath = path.join(parentDir, 'index.ts');
    
    try {
        const items = await fs.readdir(parentDir, { withFileTypes: true });
        const components = items
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        const content = components
            .map(component => type === 'Type' ? `export type { T${component.replace(/(Types?)$/, '')} } from './${component}';` :
                type === 'Hook' ? `export { ${component.startsWith('use') ? '' : 'use'}${component} } from './${component.startsWith('use') ? '' : 'use'}${component}';` :
                `export { ${component} } from './${component}';`)
            .join('\n') + '\n';

        await fs.writeFile(indexPath, content);
        console.log(chalk.green(`✅ Parent index.ts updated!`));
    } catch (error) {
        if (error instanceof Error && 'code' in error) {
            const nodeError = error as NodeJS.ErrnoException;
            if (nodeError.code === 'ENOENT') {
                await fs.ensureDir(parentDir);
                await fs.writeFile(indexPath, '');
                return updateParentIndex(parentDir, type);
            }
        }
        throw error;
    }
}