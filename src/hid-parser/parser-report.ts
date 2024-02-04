import _ from "lodash";
import { GlobalItem, Item, LocalItem, MainItem, TokenWithValue } from "./parser-item";
import { GlobalItemTag, ItemType, LocalItemTag, MainItemTag } from "./values";
import { explainItem, explainUsage } from "./explain-item";

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
  items: Item[];

  usagePageItem?: GlobalItem;
}

export interface CollectionNode extends Node {
  type: NodeType.Collection;
  children: Node[];
}

export interface ReportNode extends Node {
  type: NodeType.Report;

  usages: any[];
}

export interface TokenWithReference extends TokenWithValue {
  reference: Node;
}

export class StateManager {
  global: Partial<Record<GlobalItemTag, GlobalItem>> = {}
  local: LocalItem[] = [];

  pushGlobal(item: GlobalItem) {
    if ([GlobalItemTag.Push, GlobalItemTag.Pop].includes(item.globalTag))
      throw new Error(`cannot append push/pop to global state`);

    const tag = item.globalTag;
    this.global[tag] = item;
  }

  pushLocal(item: LocalItem) {
    this.local.push(item);
  }

  push(item: Item) {
    if (item.type === ItemType.Global) {
      this.pushGlobal(item as GlobalItem);
    } else if (item.type === ItemType.Local) {
      this.pushLocal(item as LocalItem);
    } else {
      throw new Error(`cannot push main item to state`);
    }
  }

  freeze(): Item[] {
    const global = _.values(this.global);
    const local = _.values(this.local);
    return [...global, ...local]
  }

  clear() {
    this.local = [];
  }
}

export class ReportParser {
  items: Item[] = [];
  state = new StateManager();

  reflecteTokens: TokenWithReference[] = [];
  roots: Node[] = [];
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
        this.buildNode(item);
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

  buildNode(item: MainItem) {
    const report: ReportNode = {
      type: NodeType.Report,
      parent: this.stack[this.stack.length - 1],
      items: [...this.state.freeze(), item],
      usagePageItem: this.state.global[GlobalItemTag.UsagePage],
      usages: [],
    };
    this.state.clear();

    if (this.stack.length === 0)
      throw new Error("add report to collection while collection does not exist");

    const collection = this.stack[this.stack.length - 1];
    collection.children.push(report);
  }

  enterCollection() {
    const collection: CollectionNode = {
      type: NodeType.Collection,
      parent: this.stack[this.stack.length - 1],
      items: this.state.freeze(),
      usagePageItem: this.state.global[GlobalItemTag.UsagePage],
      children: [],
    };
    this.state.clear();

    if (this.stack.length === 0) {
      this.roots.push(collection);
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
}



const usageToString = (node: Node, item: LocalItem) => {
  if (item.localTag !== LocalItemTag.Usage)
    throw new Error("item is not usage");
  if (!node.usagePageItem)
    throw new Error("node does not have usage page item");

  const doc = explainUsage(node.usagePageItem.data, item.data);
  return doc
}

const itemToString = (wrappingNode: Node, item: Item) => {
  let doc = explainItem(item);
  if (item.type === ItemType.Local && (item as LocalItem).localTag === LocalItemTag.Usage) {
    doc += ` (${usageToString(wrappingNode, item as LocalItem)})`;
  }
  return doc;
}

export const logHIDNode = (node: Node) => {
  const walk: (_: Node) => any = (node) => {
    node.items.forEach(v => console.log(itemToString(node, v)))
    if (node.type === NodeType.Collection) {
      (node as CollectionNode).children.forEach(n => {
        console.group(); walk(n); console.groupEnd();
      });
    }
  }
  walk(node);
}

