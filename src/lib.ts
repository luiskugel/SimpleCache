import fs from "fs/promises";

export class SimpleCache<Type> {
  value: any;
  getterFunction: (key: string) => Type | null;
  cleanupFunction: (key: string, value: any) => void;
  cacheInvalidationTime: number;
  cleanUpScheduler: any;
  constructor(
    cacheInvalidationTime: number,
    getterFunction: (key: string) => Type | null,
    cleanupFunction = (key: string, value: Type) => {}
  ) {
    this.value = {};
    if (getterFunction === undefined) getterFunction = (key: string) => null;
    this.getterFunction = getterFunction;
    this.cleanupFunction = cleanupFunction;
    this.cacheInvalidationTime = cacheInvalidationTime;
    this.cleanUpScheduler = setInterval(
      this.cleanUp,
      cacheInvalidationTime / 10
    );
  }
  async get(key: string): Promise<Type | null> {
    if (this.exists(key)) return this.value[key].value;
    const newCacheValue = await this.getterFunction(key);
    //to prevent race conditions
    if (this.exists(key)) return this.value[key].value;
    this.value[key] = {
      value: newCacheValue,
      date: Date.now(),
    };
    return newCacheValue;
  }
  exists(key: string) {
    return this.value[key] !== undefined;
  }
  add(key: string, value: Type) {
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

export class ArrayCache<Type> extends SimpleCache<Type> {
  constructor(
    cacheInvalidationTime: number,
    getterFunction: (key: string) => Type | null,
    cleanupFunction: (key: string, value: Type) => void
  ) {
    super(cacheInvalidationTime, getterFunction, cleanupFunction);
  }
  push(key: string, value: Type): void {
    if (!this.value[key]) this.value[key] = {};
    if (!this.value[key].value) this.value[key].value = [];
    this.value[key].value = [...this.value[key].value, value];
    this.value[key].date = Date.now();
  }
  pushArray(key: string, valueArray: Type[]): void {
    this.value[key].value = [...this.value[key].value, ...valueArray];
    this.value[key].date = Date.now();
  }
  drop(key: string, value: Type): void {
    this.value[key].value = this.value[key].value.filter(
      (storedValue: Type) => storedValue !== value
    );
  }
  dropArray(key: string, valueArray: Type[]): Type {
    this.value[key].value = this.value[key].value.filter(
      (storedValue: Type) => !valueArray.includes(storedValue)
    );
    return this.value[key].value.filter((storedValue: Type) =>
      valueArray.includes(storedValue)
    );
  }
}

export class JSONFileHandler {
  filename: string;
  saveTimeout: number;
  value: any;
  saveRoutine: undefined | NodeJS.Timeout;
  locked: boolean;
  constructor(filename: string, saveTimeout: number) {
    this.filename = filename;
    this.saveTimeout = saveTimeout;
    this.value = undefined;
    this.saveRoutine = undefined;
    this.locked = false;
  }
  async get(lock = true) {
    if (lock && this.locked) wait(10);
    if (lock) this.locked = true;
    if (this.value) return this.value;
    this.value = JSON.parse(await fs.readFile(this.filename, "utf8"));
    return this.value;
  }
  set(data: any, lock = false) {
    if (this.saveRoutine) clearTimeout(this.saveRoutine);
    this.value = data;
    this.saveRoutine = setTimeout(this.save, this.saveTimeout);
    if (!this.locked)
      throw Error(
        "The Ressource was not locked before writing! This can lead to race conditions!"
      );
    this.locked = lock;
  }
  save = async () => {
    await fs.writeFile(this.filename, JSON.stringify(this.value), {
      encoding: "utf-8",
    });
  };
}

export function createCompositeKey(...keyParts: string[]): string {
  return keyParts.join("#");
}

export function splitCompositeKey(key: string): string[] {
  return key.split("#");
}

function wait(timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}
