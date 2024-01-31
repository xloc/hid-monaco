
export enum ItemSize {
  ZeroByte = 0,
  OneByte = 1,
  TwoBytes = 2,
  FourBytes = 3,
}

export enum ItemType {
  Main = 0,
  Global = 1,
  Local = 2,
}

export enum MainItemTag {
  Input = 0x8, // 0b1000
  Output = 0x9, // 0b1001
  Feature = 0xB, // 0b1011
  Collection = 0xA, // 0b1010
  EndCollection = 0xC, // 0b1100
}

export enum GlobalItemTag {
  UsagePage = 0x0,
  LogicalMinimum = 0x1,
  LogicalMaximum = 0x2,
  PhysicalMinimum = 0x3,
  PhysicalMaximum = 0x4,
  UnitExponent = 0x5,
  Unit = 0x6,
  ReportSize = 0x7,
  ReportID = 0x8,
  ReportCount = 0x9,
  Push = 0xA,
  Pop = 0xB,
}

export enum LocalItemTag {
  Usage = 0x0,
  UsageMinimum = 0x1,
  UsageMaximum = 0x2,
  DesignatorIndex = 0x3,
  DesignatorMinimum = 0x4,
  DesignatorMaximum = 0x5,
  StringIndex = 0x7,
  StringMinimum = 0x8,
  StringMaximum = 0x9,
  Delimiter = 0xA,
}
