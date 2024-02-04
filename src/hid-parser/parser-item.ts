import { Token, TokenType } from "./lexer";
import { GlobalItemTag, ItemSize, ItemType, LocalItemTag, MainItemTag } from "./values";

export interface TokenWithValue extends Token {
  value: number;
}

export interface BitField {
  offset: number;
  size: number;
  description: string;
  options: {
    [key: number]: {
      brief: string,
      details: string
    }
  };
}

export interface Item {
  prefixToken: TokenWithValue;
  dataTokens: TokenWithValue[];

  size: ItemSize;
  type: ItemType;
  rawTag: number;
  data: number;
}

export interface MainItem extends Item {
  type: ItemType.Main;
  mainTag: MainItemTag;
}

export interface GlobalItem extends Item {
  type: ItemType.Global;
  globalTag: GlobalItemTag;
}

export interface LocalItem extends Item {
  type: ItemType.Local;
  localTag: LocalItemTag;
}


const tokensToValue = (tokens: TokenWithValue[]) => {
  return tokens.reduce((prev, curr) => prev << 8 | curr.value, 0);
}

export class ItemParser {
  tokens: TokenWithValue[];
  items: Item[] = [];
  constructor(tokens: Token[]) {
    this.tokens = tokens
      .filter(t => t.type === TokenType.Data)
      .map(t => ({ ...t, value: parseInt(t.text, 16) }));
  }

  parse() {
    while (this.tokens.length > 0) {
      const item = this.parseItem();
      this.items.push(item);
    }
  }

  parseItem(): Item {
    const prefix = this.tokens.shift();
    if (!prefix) throw new Error("prefix cannot be undefined");

    const size = prefix.value & 0x03;
    const type = (prefix.value >> 2) & 0x03;
    const tag = (prefix.value >> 4) & 0x0F;

    switch (type) {
      case ItemType.Main:
        return this.parseMainItem(prefix, size, tag);
      case ItemType.Global:
        return this.parseGlobalItem(prefix, size, tag);
      case ItemType.Local:
        return this.parseLocalItem(prefix, size, tag);
      default:
        throw new Error(`Unknown Item type ${type}`);
    }
  }

  parseMainItem(prefix: TokenWithValue, size: number, tag: number): MainItem {
    switch (tag) {
      // @ts-expect-error fallthrough case in switch
      case MainItemTag.EndCollection:
        size = 0;
      case MainItemTag.Input:
      case MainItemTag.Output:
      case MainItemTag.Feature:
      case MainItemTag.Collection:
        const dataTokens = this.tokens.splice(0, size);
        return {
          prefixToken: prefix,
          dataTokens,
          size: size,
          type: ItemType.Main,
          rawTag: tag,
          mainTag: tag,
          data: tokensToValue(dataTokens),
        }
      default:
        throw new Error(`Unknown main tag value=${tag}`);
    }
  }

  parseGlobalItem(prefix: TokenWithValue, size: number, tag: number): GlobalItem {
    switch (tag) {
      case GlobalItemTag.UsagePage:
      case GlobalItemTag.LogicalMinimum:
      case GlobalItemTag.LogicalMaximum:
      case GlobalItemTag.PhysicalMinimum:
      case GlobalItemTag.PhysicalMaximum:
      case GlobalItemTag.UnitExponent:
      case GlobalItemTag.Unit:
      case GlobalItemTag.ReportSize:
      case GlobalItemTag.ReportID:
      case GlobalItemTag.ReportCount:
      case GlobalItemTag.Push:
      case GlobalItemTag.Pop:
        const dataTokens = this.tokens.splice(0, size);
        return {
          prefixToken: prefix,
          dataTokens: dataTokens,
          size: size,
          type: ItemType.Global,
          rawTag: tag,
          globalTag: tag,
          data: tokensToValue(dataTokens),
        }
      default:
        throw new Error(`Unknown global tag value=${tag}`);
    }
  }
  parseLocalItem(prefix: TokenWithValue, size: number, tag: number): LocalItem {
    switch (tag) {
      case LocalItemTag.Usage:
      case LocalItemTag.UsageMinimum:
      case LocalItemTag.UsageMaximum:
      case LocalItemTag.DesignatorIndex:
      case LocalItemTag.DesignatorMinimum:
      case LocalItemTag.DesignatorMaximum:
      case LocalItemTag.StringIndex:
      case LocalItemTag.StringMinimum:
      case LocalItemTag.StringMaximum:
      case LocalItemTag.Delimiter:
        const dataTokens = this.tokens.splice(0, size);
        return {
          prefixToken: prefix,
          dataTokens: dataTokens,
          size: size,
          type: ItemType.Local,
          rawTag: tag,
          localTag: tag,
          data: tokensToValue(dataTokens),
        }
      default:
        throw new Error(`Unknown local tag value=${tag}`);
    }
  }
}

