"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitCompositeKey = exports.createCompositeKey = exports.JSONFileHandler = exports.ArrayCache = exports.SimpleCache = void 0;
const promises_1 = __importDefault(require("fs/promises"));
class SimpleCache {
    constructor(cacheInvalidationTime, getterFunction = (key) => { }, cleanupFunction = (key, value) => { }) {
        this.cleanUp = () => {
            const keys = Object.keys(this.value);
            keys.forEach(async (key) => {
                if (this.value[key].date + this.cacheInvalidationTime < Date.now()) {
                    await this.cleanupFunction(key, this.value[key].value);
                    delete this.value[key];
                }
            });
        };
        this.value = {};
        this.getterFunction = getterFunction;
        this.cleanupFunction = cleanupFunction;
        this.cacheInvalidationTime = cacheInvalidationTime;
        this.cleanUpScheduler = setInterval(this.cleanUp, cacheInvalidationTime / 10);
    }
    async get(key) {
        if (this.value[key])
            return this.value[key].value;
        const newCacheValue = await this.getterFunction(key);
        this.value[key] = {
            value: newCacheValue,
            date: Date.now(),
        };
        return newCacheValue;
    }
    exists(key) {
        return this.value[key] !== undefined;
    }
    add(key, value) {
        this.value[key] = {
            value: value,
            date: Date.now(),
        };
    }
    remove(key) {
        delete this.value[key];
    }
}
exports.SimpleCache = SimpleCache;
class ArrayCache extends SimpleCache {
    constructor(cacheInvalidationTime, getterFunction = (key) => { }, cleanupFunction = (key, value) => { }) {
        super(cacheInvalidationTime, getterFunction, cleanupFunction);
    }
    push(key, value) {
        if (!this.value[key])
            this.value[key] = {};
        if (!this.value[key].value)
            this.value[key].value = [];
        this.value[key].value = [...this.value[key].value, value];
        this.value[key].date = Date.now();
    }
    pushArray(key, valueArray) {
        this.value[key].value = [...this.value[key].value, ...valueArray];
        this.value[key].date = Date.now();
    }
    drop(key, value) {
        this.value[key].value = this.value[key].value.filter((storedValue) => storedValue !== value);
    }
    dropArray(key, valueArray) {
        this.value[key].value = this.value[key].value.filter((storedValue) => !valueArray.includes(storedValue));
        return this.value[key].value.filter((storedValue) => valueArray.includes(storedValue));
    }
}
exports.ArrayCache = ArrayCache;
class JSONFileHandler {
    constructor(filename, saveTimeout) {
        this.filename = filename;
        this.saveTimeout = saveTimeout;
        this.value = undefined;
        this.saveRoutine = undefined;
    }
    async get() {
        if (this.value)
            return this.value;
        this.value = await promises_1.default.readFile(this.filename, "utf8");
        return this.value;
    }
    set(data) {
        if (this.saveRoutine)
            clearTimeout(this.saveRoutine);
        this.value = data;
        this.saveRoutine = setTimeout(this.save, this.saveTimeout);
    }
    async save() {
        await promises_1.default.writeFile(this.filename, this.value, { encoding: "utf-8" });
    }
}
exports.JSONFileHandler = JSONFileHandler;
function createCompositeKey(...keyParts) {
    return keyParts.join("#");
}
exports.createCompositeKey = createCompositeKey;
function splitCompositeKey(key) {
    return key.split("#");
}
exports.splitCompositeKey = splitCompositeKey;
