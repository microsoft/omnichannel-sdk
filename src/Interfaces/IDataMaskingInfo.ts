interface IDataMaskingRule {
  ruleId: string;
  regex: string;
}

interface IDataMaskingSetting {
  maskForCustomer: boolean;
  maskForAgent: boolean;
}

export default interface IDataMaskingInfo {
  dataMaskingRules: IDataMaskingRule[];
  setting: IDataMaskingSetting;
}
