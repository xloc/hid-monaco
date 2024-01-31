import { globalItemTagDocMapping, itemTypeDocMapping, localItemTagDocMapping, mainItemTagDocMapping } from "./docs";
import { GlobalItem, Item, LocalItem, MainItem } from "./parser-item";
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
    [GlobalItemTag.UsagePage]: toHex,
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
  const tag = getTagDoc(item);

  const dataValue = item.dataTokens.reduce((prev, curr) => prev << 8 | curr.value, 0)
  const data = (dataFormatters as any)[item.type][item.rawTag]?.(dataValue) ?? "N/A";

  return `${type}::${tag} = ${data}`;
}
