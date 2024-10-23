export {};
/* eslint-disable @typescript-eslint/no-explicit-any */
const testsContext = (require as any).context(".", true, /\.spec.ts$/);
testsContext.keys().forEach(testsContext);

// add all ts files to include non referenced files in report
const srcContext = (require as any).context("../src", true, /^\.\/(?!app(\.ts)?$)/);
srcContext.keys().forEach(srcContext);
