/// <reference types="node" />
export declare class SimpleCache<Type> {
    value: any;
    getterFunction: (key: string) => Type | null;
    cleanupFunction: (key: string, value: any) => void;
    cacheInvalidationTime: number;
    cleanUpScheduler: any;
    constructor(cacheInvalidationTime: number, getterFunction: (key: string) => Type | null, cleanupFunction?: (key: string, value: Type) => void);
    get(key: string): Promise<Type | null>;
    exists(key: string): boolean;
    add(key: string, value: Type): void;
    remove(key: any): void;
    refresh(key: string): void;
    removeOldest(): void;
    cleanUp: () => void;
}
export declare class ArrayCache<Type> extends SimpleCache<Type> {
    constructor(cacheInvalidationTime: number, getterFunction: (key: string) => Type | null, cleanupFunction: (key: string, value: Type) => void);
    push(key: string, value: Type): void;
    pushArray(key: string, valueArray: Type[]): void;
    drop(key: string, value: Type): void;
    dropArray(key: string, valueArray: Type[]): Type;
}
export declare class JSONFileHandler {
    filename: string;
    saveTimeout: number;
    value: any;
    saveRoutine: undefined | NodeJS.Timeout;
    locked: boolean;
    constructor(filename: string, saveTimeout: number);
    get(lock?: boolean): Promise<any>;
    set(data: any, lock?: boolean): void;
    save: () => Promise<void>;
}
export declare function createCompositeKey(...keyParts: string[]): string;
export declare function splitCompositeKey(key: string): string[];
