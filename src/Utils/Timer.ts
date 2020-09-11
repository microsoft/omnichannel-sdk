import ITimer from "../../src/Interfaces/ITimer";

export class Timer {
  public static TIMER(): ITimer {
    const timeStart = new Date().getTime();
    return {
      get milliSecondsElapsed() {
        return (new Date().getTime() - timeStart);
      }
    };
  }
}
