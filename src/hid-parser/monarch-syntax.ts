import * as monaco from "monaco-editor";

export const hidDescriptorMonarchSyntax: monaco.languages.IMonarchLanguage = {
  tokenizer: {
    root: [
      [/\/\/.+$/, 'comment'],
      [/,/, 'delimiter'],
      [/(0[xX])[0-9a-fA-F]+/, 'number.hex'],
    ],
  }
}