import { BitField } from "./parser-item";
import { GlobalItemTag, ItemSize, ItemType, LocalItemTag, MainItemTag } from "./values";

export const itemSizeDocMapping = {
  [ItemSize.ZeroByte]: "Zero bytes",
  [ItemSize.OneByte]: "One byte",
  [ItemSize.TwoBytes]: "Two bytes",
  [ItemSize.FourBytes]: "Four bytes",
} as const;

export const itemTypeDocMapping = {
  [ItemType.Main]: "Main",
  [ItemType.Global]: "Global",
  [ItemType.Local]: "Local",
} as const;

export const mainItemTagDocMapping = {
  [MainItemTag.Input]: "Input",
  [MainItemTag.Output]: "Output",
  [MainItemTag.Feature]: "Feature",
  [MainItemTag.Collection]: "Collection",
  [MainItemTag.EndCollection]: "End Collection",
} as const;

export const globalItemTagDocMapping = {
  [GlobalItemTag.UsagePage]: "Usage Page",
  [GlobalItemTag.LogicalMinimum]: "Logical Minimum",
  [GlobalItemTag.LogicalMaximum]: "Logical Maximum",
  [GlobalItemTag.PhysicalMinimum]: "Physical Minimum",
  [GlobalItemTag.PhysicalMaximum]: "Physical Maximum",
  [GlobalItemTag.UnitExponent]: "Unit Exponent",
  [GlobalItemTag.Unit]: "Unit",
  [GlobalItemTag.ReportSize]: "Report Size",
  [GlobalItemTag.ReportID]: "Report ID",
  [GlobalItemTag.ReportCount]: "Report Count",
  [GlobalItemTag.Push]: "Push",
  [GlobalItemTag.Pop]: "Pop",
} as const;

export const localItemTagDocMapping = {
  [LocalItemTag.Usage]: "Usage",
  [LocalItemTag.UsageMinimum]: "Usage Minimum",
  [LocalItemTag.UsageMaximum]: "Usage Maximum",
  [LocalItemTag.DesignatorIndex]: "Designator Index",
  [LocalItemTag.DesignatorMinimum]: "Designator Minimum",
  [LocalItemTag.DesignatorMaximum]: "Designator Maximum",
  [LocalItemTag.StringIndex]: "String Index",
  [LocalItemTag.StringMinimum]: "String Minimum",
  [LocalItemTag.StringMaximum]: "String Maximum",
  [LocalItemTag.Delimiter]: "Delimiter",
} as const;



export const inputOutputFeatureData: BitField[] = [
  {
    offset: 0,
    size: 1,
    options: {
      0: { brief: "data", details: "report fields that contain modifiable device data." },
      1: { brief: "constant", details: "static read-only field and cannot be modified (written) by the host." }
    },
    description: ""
  },
  {
    offset: 1,
    size: 1,
    options: {
      0: { brief: "array", details: "the report field is an array of data." },
      1: { brief: "variable", details: "the report field is a variable." }
    },
    description: ""
  },
  {
    offset: 2,
    size: 1,
    options: {
      0: { brief: "absolute", details: "based on a fixed origin" },
      1: { brief: "relative", details: "indicating the change in value from the last report" }
    },
    description: "Mouse devices usually provide relative data, while tablets usually provide absolute data."
  },
  {
    offset: 3,
    size: 1,
    options: {
      0: { brief: "no wrap", details: "the value does not wrap to the other side of the range." },
      1: { brief: "wrap", details: "the value wraps to the other side of the range." }
    },
    description: "if a field's range is 0-10 and the current value is 10, then a 'no wrap' field will stay at 10 until it is explicitly changed to a lower value, while a 'wrap' field will change to 0 on the next increment."
  },
  {
    offset: 4,
    size: 1,
    options: {
      0: { brief: "linear", details: "the value is linear." },
      1: { brief: "non-linear", details: "the value is non-linear." }
    },
    description: "a volume control might be linear, while a brightness control might be non-linear."
  },
  {
    offset: 5,
    size: 1,
    options: {
      0: { brief: "preferred state", details: "the value is the preferred state for the control." },
      1: { brief: "no preferred", details: "the control has no preferred state." }
    },
    description: "a power control might have a preferred state of 'on'."
  },
  {
    offset: 6,
    size: 1,
    options: {
      0: { brief: "null state", details: "the control has a null state." },
      1: { brief: "no null position", details: "the control has no null position." }
    },
    description: "a null state is a position that indicates that the control is not actuated."
  },
  // {
  //   offset: 7,
  //   size: 1,
  //   options: {
  //   },
  //   description: "reserved"
  // },
  {
    offset: 8,
    size: 1,
    options: {
      0: { brief: "bit field", details: "emits a fixed-size stream of bytes, not interpreted as a single numeric quantity" },
      1: { brief: "buffered bytes", details: "emits a variable-length stream of bytes, not interpreted as a single numeric quantity. must be aligned on an 8-bit boundary" }
    },
    description: "The data from a bar code reader is an example."
  }
];

export const usagePageDataMapping: Record<UsagePage, string> = {
  0x01: "Generic Desktop Controls",
  0x02: "Simulation Controls",
  0x03: "VR Controls",
  0x04: "Sport Controls",
  0x05: "Game Controls",
  0x06: "Generic Device Controls",
  0x07: "Keyboard/Keypad",
  0x08: "LED",
  0x09: "Button",
  0x0A: "Ordinal",
  0x0B: "Telephony",
  0x0C: "Consumer",
  0x0D: "Digitizer",
  0x0E: "Haptics",
  0x0F: "Physical Interface Device",
  0x10: "Unicode",
}

export enum UsagePage {
  GenericDesktopControls = 0x01,
  SimulationControls = 0x02,
  VRControls = 0x03,
  SportControls = 0x04,
  GameControls = 0x05,
  GenericDeviceControls = 0x06,
  KeyboardKeypad = 0x07,
  LED = 0x08,
  Button = 0x09,
  Ordinal = 0x0A,
  Telephony = 0x0B,
  Consumer = 0x0C,
  Digitizer = 0x0D,
  Haptics = 0x0E,
  PhysicalInterfaceDevice = 0x0F,
  Unicode = 0x10,
}

export const usageDataMapping = {
  [UsagePage.GenericDesktopControls]: {
    0x01: "Pointer",
    0x02: "Mouse",
    0x04: "Joystick",
    0x05: "Game Pad",
    0x06: "Keyboard",
    0x07: "Keypad",
    0x08: "Multi-axis Controller",
    0x09: "Tablet PC System Controls",
  }
} as const
