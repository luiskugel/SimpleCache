export class SimpleCache {
  value: any;
  getterFunction: (key: string) => void;
  cleanupFunction: (key: string, value: any) => void;
  cacheInvalidationTime: number;
  cleanUpScheduler: any;
  constructor(
    cacheInvalidationTime: number,
    getterFunction = (key: string) => {},
    cleanupFunction = (key: string, value: any) => {}
  ) {
    this.value = {};
    this.getterFunction = getterFunction;
    this.cleanupFunction = cleanupFunction;
    this.cacheInvalidationTime = cacheInvalidationTime;
    this.cleanUpScheduler = setInterval(
      this.cleanUp,
      cacheInvalidationTime / 10
    );
  }
  async get(key: string) {
    if (this.value[key]) return this.value[key].value;
    const newCacheValue = await this.getterFunction(key);
    this.value[key] = {
      value: newCacheValue,
      date: Date.now(),
    };
    return newCacheValue;
  }
  exists(key: string) {
    return this.value[key] !== undefined;
  }
  add(key: string, value: any) {
    this.value[key] = {
      value: value,
      date: Date.now(),
    };
  }
  remove(key: any) {
    delete this.value[key];
  }
  cleanUp = () => {
    const keys = Object.keys(this.value);
    keys.forEach(async (key) => {
      if (this.value[key].date + this.cacheInvalidationTime < Date.now()) {
        await this.cleanupFunction(key, this.value[key].value);
        delete this.value[key];
      }
    });
  };
}

export class ArrayCache extends SimpleCache {
  constructor(
    cacheInvalidationTime: number,
    getterFunction = (key: string) => {},
    cleanupFunction = (key: string, value: any) => {}
  ) {
    super(cacheInvalidationTime, getterFunction, cleanupFunction);
  }
  push(key: string, value: any): void {
    if (!this.value[key]) this.value[key] = {};
    if (!this.value[key].value) this.value[key].value = [];
    this.value[key].value = [...this.value[key].value, value];
    this.value[key].date = Date.now();
  }
  pushArray(key: string, valueArray: any[]): void {
    this.value[key].value = [...this.value[key].value, ...valueArray];
    this.value[key].date = Date.now();
  }
  drop(key: string, value: any): void {
    this.value[key].value = this.value[key].value.filter(
      (storedValue: any) => storedValue !== value
    );
  }
  dropArray(key: string, valueArray: any[]): any {
    this.value[key].value = this.value[key].value.filter(
      (storedValue: any) => !valueArray.includes(storedValue)
    );
    return this.value[key].value.filter((storedValue: any) =>
      valueArray.includes(storedValue)
    );
  }
}

export function createCompositeKey(...keyParts: string[]): string {
  return keyParts.join("#");
}

export function splitCompositeKey(key: string): string[] {
  return key.split("#");
}
