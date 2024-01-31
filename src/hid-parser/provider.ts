import * as monaco from "monaco-editor";
import { globalItemTagDocMapping, inputOutputFeatureData, itemSizeDocMapping, itemTypeDocMapping, localItemTagDocMapping, mainItemTagDocMapping } from "./docs";
import { GlobalItem, Item, ItemParser, LocalItem, MainItem } from "./parser-item";
import { Token, tokenGenerator } from "./lexer";
import { ItemType, MainItemTag } from "./values";
import { ReportParser } from "./parser-report";


const getTagDoc = (item: Item) => {
  switch (item.type) {
    case ItemType.Main:
      return mainItemTagDocMapping[(item as MainItem).mainTag];
    case ItemType.Global:
      return globalItemTagDocMapping[(item as GlobalItem).globalTag];
    case ItemType.Local:
      return localItemTagDocMapping[(item as LocalItem).localTag];
  }
}

const getInputOutputFeatureDoc = (data: number) => {
  return inputOutputFeatureData.map(field => {
    const value = (data >> field.offset) & ((1 << field.size) - 1);
    const option = field.options[value];
    return `- \`${toBinary(value, field.size)}\` (bit ${field.offset}) - ${option.brief} / ~~${field.options[value ? 0 : 1].brief}~~\n`;
  })
}

const toBinary = (n: number, padding?: number, width = 0) => {
  if (padding === undefined) padding = 8;
  return n.toString(2).padStart(padding, '0').padStart(width, ' ');
}

const toHex = (n: number, padding?: number, width = 0) => {
  if (padding === undefined) padding = 2;
  return n.toString(16).padStart(padding, '0').padStart(width, ' ');
}

const isTokenUnderPosition = (token: Token, position: monaco.Position) => {
  return token.range.startLineNumber <= position.lineNumber &&
    token.range.endLineNumber >= position.lineNumber &&
    token.range.startColumn <= position.column &&
    token.range.endColumn >= position.column;
}

export class HIDDescriptorProvider implements monaco.languages.DocumentFormattingEditProvider, monaco.languages.HoverProvider {
  parser?: ItemParser;
  constructor() {

  }

  provideHover(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    cancellationToken: monaco.CancellationToken
  ): monaco.languages.ProviderResult<monaco.languages.Hover> {
    if (!this.parser) return undefined;

    const prefixItem = this.parser.items.find(i => isTokenUnderPosition(i.prefixToken, position));
    if (prefixItem) {
      const item = prefixItem;
      return {
        contents: [{
          value: [
            `\`0x${toHex(item.prefixToken.value)} = 0b${toBinary(item.prefixToken.value)}\`\n\n`,
            `- \`${toBinary(item.size, 2)}\`- size: ${itemSizeDocMapping[item.size]}\n`,
            `- \`${toBinary(item.type, 2)}\`- type: ${itemTypeDocMapping[item.type]}\n`,
            `- \`${toBinary((item as any).rawTag, 4)}\`- tag: ${getTagDoc(item)}\n`,
          ].join(''),
        }]
      };
    }

    const dataItem = this.parser.items.find(i => {
      return i.dataTokens.some(t => isTokenUnderPosition(t, position));
    });
    if (dataItem) {
      const token = dataItem.dataTokens.find(t => isTokenUnderPosition(t, position));
      if (!token) return undefined;

      const doc = [`\`0x${toHex(token.value)} = 0b${toBinary(token.value)}\`\n`];

      if (dataItem.type === ItemType.Main) {
        const tag = (dataItem as MainItem).mainTag
        switch (tag) {
          case MainItemTag.Input:
          case MainItemTag.Output:
          case MainItemTag.Feature:
            const value = dataItem.dataTokens.reduce((prev, curr) => prev << 8 | curr.value, 0);
            doc.push(`Main Item > ${mainItemTagDocMapping[tag]}\n\n`, ...getInputOutputFeatureDoc(value));
        }
      }

      return {
        contents: [{
          value: doc.join(''),
        }]
      };

    }

  }

  provideDocumentFormattingEdits(
    model: monaco.editor.ITextModel,
    options: monaco.languages.FormattingOptions,
    token: monaco.CancellationToken
  ): monaco.languages.ProviderResult<monaco.languages.TextEdit[]> {
    const text = model.getLinesContent();
    const tokens = [...tokenGenerator(text)];
    // console.log(tokens);
    const items = new ItemParser(tokens);
    items.parse();
    // console.log(parser.tree);
    this.parser = items;


    const reports = new ReportParser(items.items);
    reports.parse();
    reports.log(reports.root!);

    return undefined;
  }
}