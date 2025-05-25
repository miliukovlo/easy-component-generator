import { 
    getComponentTemplate, 
    getFileTemplate, 
    getHookTemplate, 
    getPropsTemplate, 
    getTypesTemplate,
    getStorybookTemplate
} from "../Templates";

export const getFiles = (type: string, name: string, skipStorybook: boolean = false) => {
    const baseFiles = ['UI', 'Component', 'Block'].includes(type) 
        ? [
            { name: `${name}.tsx`, content: getComponentTemplate(name) },
            { name: `${name}Types.ts`, content: getPropsTemplate(name) },
            { name: 'index.ts', content: `export * from './${name}';\n` },
        ] 
        : type === 'Type' ? [
            { name: `${name.replace(/(Types?)$/, '')}Type.ts`, content: getTypesTemplate(name) },
            { name: 'index.ts', content: `export * from './${name.replace(/(Types?)$/, '')}Type';\n` }
        ] : type === 'Hook' ? [
            { name: `${name.startsWith('use') || name.startsWith('Use') ? name : 'use' + name}.ts`, content: getHookTemplate(name) },
            { name: 'index.ts', content: `export * from './${name.startsWith('use') || name.startsWith('Use') ? name : 'use' + name}';\n` }
        ] : [
            { name: `${name}.ts`, content: getFileTemplate(name) },
            { name: 'index.ts', content: `export * from './${name}';\n` }
        ];

    if (!skipStorybook && ['UI', 'Component', 'Block'].includes(type)) {
        baseFiles.push({
            name: `${name}.stories.tsx`,
            content: getStorybookTemplate(name)
        });
    }

    return baseFiles;
}