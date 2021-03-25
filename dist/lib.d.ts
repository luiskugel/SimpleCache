/// <reference types="node" />
export declare class SimpleCache {
    value: any;
    getterFunction: (key: string) => void;
    cleanupFunction: (key: string, value: any) => void;
    cacheInvalidationTime: number;
    cleanUpScheduler: any;
    constructor(cacheInvalidationTime: number, getterFunction?: (key: string) => void, cleanupFunction?: (key: string, value: any) => void);
    get(key: string): Promise<any>;
    exists(key: string): boolean;
    add(key: string, value: any): void;
    remove(key: any): void;
    cleanUp: () => void;
}
export declare class ArrayCache extends SimpleCache {
    constructor(cacheInvalidationTime: number, getterFunction?: (key: string) => void, cleanupFunction?: (key: string, value: any) => void);
    push(key: string, value: any): void;
    pushArray(key: string, valueArray: any[]): void;
    drop(key: string, value: any): void;
    dropArray(key: string, valueArray: any[]): any;
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
