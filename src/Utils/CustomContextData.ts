export class CustomContextData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static sort(customContextData: { [key: string]: any }) : any{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tempArr = new Array<any>();

      Object.keys(customContextData).forEach(key => {  
        if (customContextData && customContextData[key]) { 
            const obj = {"key":key, "value": customContextData[key]};
            tempArr.push(obj);
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tempArr.sort((a: any, b: any) => {
        const keyA = a.key.toUpperCase(); // ignore upper and lowercase
        const keyB = b.key.toUpperCase(); // ignore upper and lowercase
        if (keyA < keyB) {
          return -1;
        }
        if (keyA > keyB) {
          return 1;
        } 
        return 0;
      });
    return tempArr;
  }
}


