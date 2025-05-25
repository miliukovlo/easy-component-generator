export function getComponentTemplate(name: string) {
    return `import React from 'react';
  import { ${name}Props } from './${name}Types';
  
  export const ${name} = (props: ${name}Props) => {
    return (
      <div>${name} component</div>
    );
  };
  `;
  }
  
export function getPropsTemplate(name: string) {
    return `export interface I${name}Props {
    // Props
  };
  `;
}

export function getTypesTemplate(name: string) {
    const baseName = name.replace(/(Types?)$/, '');
    
    return `export type T${baseName} = {
        // Type
    };`;
}

export function getHookTemplate(name: string) {
    return `export const ${name.startsWith('use') || name.startsWith('Use') ? name : 'use' + name} = () => {
        //Hook
    };`; 
}

export function getFileTemplate(name: string) {
    return `export const ${name} = () => {
        //Write here
    };`;
}