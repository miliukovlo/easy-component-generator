import { getComponentTemplate, getFileTemplate, getHookTemplate, getPropsTemplate, getTypesTemplate } from "../Templates";

export const getFiles = (type: string, name: string) => {
    return ['UI', 'Component', 'Block'].includes(type) 
          ? [
              { name: `${name}.tsx`, content: getComponentTemplate(name) },
              { name: `${name}Types.ts`, content: getPropsTemplate(name) },
              { name: 'index.ts', content: `export * from './${name}';\n` },
            ] 
          : type === 'Type' ? [
            {
              name: `${name.replace(/(Types?)$/, '')}Type.ts`,
              content: getTypesTemplate(name)
            },
            {
              name: 'index.ts', 
              content: `export * from './${name.replace(/(Types?)$/, '')}Type';\n`
            }
          ] : type === 'Hook' ? [
            {
              name: `${name.startsWith('use') || name.startsWith('Use') ? name : 'use' + name}.ts`,
              content: getHookTemplate(name)
            },
            {
              name: 'index.ts',
              content: `export * from './${name.startsWith('use') || name.startsWith('Use') ? name : 'use' + name}';\n`
            }
          ]: [
            { 
              name: `${name}.ts`, 
              content: getFileTemplate(name) 
            },
            { name: 'index.ts', content: `export * from './${name}';\n` }
          ];
}