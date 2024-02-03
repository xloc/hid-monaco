import { UsagePage, globalItemTagDocMapping, itemTypeDocMapping, localItemTagDocMapping, mainItemTagDocMapping, usageDataMapping, usagePageDataMapping } from "./docs";
import { GlobalItem, Item, LocalItem, MainItem } from "./parser-item";
import { CollectionNode, Node, NodeType } from './parser-report';
import { GlobalItemTag, ItemType, LocalItemTag, MainItemTag } from "./values";


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

const toBinary = (data: number) => '0b' + data.toString(2).padStart(8, '0');
const toHex = (data: number) => '0x' + data.toString(16).padStart(2, '0');
const toDecimal = (data: number) => data.toString(10);

const dataFormatters = {
  [ItemType.Main]: {
    [MainItemTag.Input]: toBinary,
    [MainItemTag.Output]: toBinary,
    [MainItemTag.Feature]: toBinary,
  },
  [ItemType.Global]: {
    [GlobalItemTag.UsagePage]: (data: number) => (usagePageDataMapping as any)[data] ?? toHex(data),
    [GlobalItemTag.LogicalMinimum]: toDecimal,
    [GlobalItemTag.LogicalMaximum]: toDecimal,
    [GlobalItemTag.PhysicalMinimum]: toDecimal,
    [GlobalItemTag.PhysicalMaximum]: toDecimal,
    [GlobalItemTag.UnitExponent]: toDecimal,
    [GlobalItemTag.Unit]: toHex,
    [GlobalItemTag.ReportSize]: toDecimal,
    [GlobalItemTag.ReportID]: toHex,
    [GlobalItemTag.ReportCount]: toDecimal,
    [GlobalItemTag.Push]: undefined,
    [GlobalItemTag.Pop]: undefined,
  },
  [ItemType.Local]: {
    [LocalItemTag.Usage]: toHex,
    [LocalItemTag.UsageMinimum]: toDecimal,
    [LocalItemTag.UsageMaximum]: toDecimal,
    [LocalItemTag.DesignatorIndex]: toDecimal,
    [LocalItemTag.DesignatorMinimum]: toDecimal,
    [LocalItemTag.DesignatorMaximum]: toDecimal,
    [LocalItemTag.StringIndex]: toDecimal,
    [LocalItemTag.StringMinimum]: toDecimal,
    [LocalItemTag.StringMaximum]: toDecimal,
    [LocalItemTag.Delimiter]: undefined,
  }
}

export const explainItem = (item: Item) => {
  const type = itemTypeDocMapping[item.type];
  const tag = getTagDoc(item).replace(/ /g, '');

  const dataValue = item.dataTokens.reduce((prev, curr) => prev << 8 | curr.value, 0)
  const data = (dataFormatters as any)[item.type][item.rawTag]?.(dataValue) ?? "N/A";

  return `${type}::${tag} = ${data}`;
}

export const explainUsage = (usagePage: UsagePage, usage?: number) => {
  if (usage === undefined) return toHex(usagePage);
  const usageDoc = (usageDataMapping as any)[usagePage]?.[usage] as string | undefined;

  if (usageDoc) return `${usagePageDataMapping[usagePage].replace(/ /g, '')}/${usageDoc.replace(/ /g, '')}`;
  else return `${usagePageDataMapping[usagePage]}: ${toHex(usage)}`;
}

export const logHIDNode = (node: Node) => {
  const walk: (_: Node) => any = (node) => {
    node.items.forEach(v => console.log(explainItem(v)))
    if (node.type === NodeType.Collection) {
      (node as CollectionNode).children.forEach(n => {
        console.group(); walk(n); console.groupEnd();
      });
    }
  }
  walk(node);
}