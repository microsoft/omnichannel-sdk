interface IDataMaskingRule {
  ruleId: string;
  regex: string;
}

interface IDataMaskingSetting {
  maskForCustomer: boolean;
  maskForAgent: boolean;
}
// Adding a comment for a change
export default interface IDataMaskingInfo {
  dataMaskingRules: IDataMaskingRule[];
  setting: IDataMaskingSetting;
}
