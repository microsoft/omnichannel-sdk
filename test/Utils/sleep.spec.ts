import sleep from "../../src/Utils/sleep";

describe("sleep unit tests", () => {
  it("foo", async () => {
    const startTime = new Date().getTime();
    const duration = 2000;
    await sleep(duration);
    const endTime = new Date().getTime();
    const calculatedDuration = (endTime - startTime) / 1000
    expect(calculatedDuration.toFixed()).toEqual((duration / 1000).toFixed());
  });
});
