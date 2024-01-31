import { explainItem } from "./explain-item";
import { Item, LocalItem, MainItem, TokenWithValue } from "./parser-item";
import { ItemType, LocalItemTag, MainItemTag } from "./values";

export enum NodeType {
  Collection,
  Report,
}

export const nodeTypeDocMapping = {
  [NodeType.Collection]: "Collection",
  [NodeType.Report]: "Report",
} as const;

export interface Node {
  type: NodeType;
  parent?: Node;
}

export interface CollectionNode extends Node {
  type: NodeType.Collection;
  children: Node[];
}

export interface ReportNode extends Node {
  type: NodeType.Report;
  items: Item[];

  usages: any[];
}

export interface TokenWithReference extends TokenWithValue {
  reference: Node;
}

export class ReportParser {
  items: Item[] = [];
  state: Item[] = [];

  reflecteTokens: TokenWithReference[] = [];
  root?: Node;
  stack: CollectionNode[] = [];

  constructor(items: Item[]) {
    this.items = items;
  }

  parse() {
    while (this.items.length > 0) {
      const item = this.items.shift()!;
      this.parseItem(item);
    }
  }

  parseItem(item: Item) {
    switch (item.type) {
      case ItemType.Global:
      case ItemType.Local:
        this.state.push(item);
        break;
      case ItemType.Main:
        const mainItem = item as MainItem;
        this.parseMainItem(mainItem);
        break;
      default:
        throw new Error(`Unknown item type ${item.type}`);
    }
  }

  parseMainItem(item: MainItem) {
    switch (item.mainTag) {
      case MainItemTag.Input:
      case MainItemTag.Output:
      case MainItemTag.Feature:
        this.buildNode();
        break;
      case MainItemTag.Collection:
        this.enterCollection();
        break;
      case MainItemTag.EndCollection:
        this.exitCollection();
        break;
      default:
        throw new Error(`Unknown main item tag ${item.mainTag}`);
    }
  }

  buildNode() {
    const report: ReportNode = {
      type: NodeType.Report,
      items: [...this.state],
      usages: this.state
        .filter(i => i.type === ItemType.Local)
        .map(i => i as LocalItem)
        .filter(i => i.localTag === LocalItemTag.Usage)
    };
    this.state = this.state.filter(i => i.type === ItemType.Global);

    if (this.stack.length === 0)
      throw new Error("add report to collection while collection does not exist");

    const collection = this.stack[this.stack.length - 1];
    collection.children.push(report);
  }

  enterCollection() {
    const collection: CollectionNode = {
      type: NodeType.Collection,
      children: [],
    };

    if (this.stack.length === 0) {
      if (this.root) throw new Error("root already exists");
      this.root = collection;
    } else {
      const parent = this.stack[this.stack.length - 1];
      collection.parent = parent;
    }
    this.stack.push(collection);
  }

  exitCollection() {
    const exited = this.stack.pop();
    if (!exited) throw new Error("no collection to exit");
    if (this.stack.length > 0) {
      const enclosed = this.stack[this.stack.length - 1];
      enclosed.children.push(exited);
    }
  }

  log(node: Node) {
    const walk: (_: Node) => any = (node) => {
      if (node.type === NodeType.Collection) {
        (node as CollectionNode).children.forEach(n => {
          console.group(); walk(n); console.groupEnd();
        });
      } else if (node.type === NodeType.Report) {
        (node as ReportNode).items.forEach(v => console.log(explainItem(v)))
      }
    }
    walk(node);
  }
}