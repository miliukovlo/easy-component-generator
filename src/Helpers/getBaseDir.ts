export const getBaseDir = (type: string, customDir: string) => {
    return type === 'Component' ? 'src/components' :
          type === 'Block' ? 'src/blocks' :
          type === 'UI' ? 'src/UI-KIT' :
          type === 'Type' ? 'src/types': 
          type === 'Hook' ? 'src/hooks/custom' :
          `src/${customDir}`
}