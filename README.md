## Simple Cache

This library provides a simple and efficient way to cache data in your Node.js applications. It offers two main cache implementations:

- **SimpleCache:** A generic cache that stores key-value pairs with an optional cleanup function and configurable invalidation time.
- **ArrayCache:** A cache specifically designed for storing arrays. It allows pushing, dropping, and filtering elements within the cached array.

The library also provides helper functions for creating composite keys and splitting them back into their parts.

### Installation

```bash
npm install @idot-digital/simplecache
```

### Usage

**SimpleCache**

```javascript
import { SimpleCache } from "@idot-digital/simplecache";

const cache = new SimpleCache(
  10000, // Cache invalidation time in milliseconds
  async (key) => {
    // This function retrieves the data for the given key
    return await fetchDataFromSource(key);
  },
  (key, value) => {
    // This function is called when a cache entry is removed
    console.log(`Cache entry for key "${key}" removed. Value:`, value);
  }
);

const data = await cache.get(key);
```

**ArrayCache**

```javascript
import { ArrayCache } from "@idot-digital/simplecache";

const arrayCache = new ArrayCache(
  60000, // Cache invalidation time in milliseconds
  async (key) => {
    // This function retrieves the array data for the given key
    return await fetchArrayDataFromSource(key);
  },
  (key, value) => {
    // This function is called when a cache entry is removed
    console.log(`Cache entry for key "${key}" removed. Value:`, value);
  }
);

function pushToArray(key, value) {
  arrayCache.push(key, value);
}

function dropFromArray(key, value) {
  arrayCache.drop(key, value);
}
```

### API Documentation

#### SimpleCache

- **constructor(cacheInvalidationTime: number, getterFunction: (key: string) => Type | null, cleanupFunction: (key: string, value: any) => void = {})**
  - Creates a new SimpleCache instance.
  - **Parameters:**
    - `cacheInvalidationTime`: The time in milliseconds after which a cached entry will be considered invalid and removed.
    - `getterFunction`: A function that retrieves the data for a given key. This function is called when data is not found in the cache.
    - `cleanupFunction` (optional): A function that is called when a cache entry is removed due to invalidation.
- **get(key: string): Promise<Type | null>**
  - Retrieves the data for the given key from the cache. If the data is not found or is invalid, the getterFunction will be called to fetch the data.
- **exists(key: string): boolean**
  - Checks if a cache entry exists for the given key.
- **add(key: string, value: Type): void**
  - Adds a key-value pair to the cache.
- **remove(key: any): void**
  - Removes the cache entry for the given key.
- **refresh(key: string): void**
  - Updates the timestamp for the given cache entry, effectively resetting its invalidation timer.
- **removeOldest(): void**
  - Removes the oldest cache entry if the cache size exceeds its internal limits.

#### ArrayCache

- **constructor(cacheInvalidationTime: number, getterFunction: (key: string) => Type | null, cleanupFunction: (key: string, value: any) => void)** (Inherits from SimpleCache)
  - Creates a new ArrayCache instance.
- **push(key: string, value: Type): void**
  - Pushes a new value to the cached array for the given key.
- **pushArray(key: string, valueArray: Type[]): void**
  - Pushes multiple values to the cached array for the given key.
- **drop(key: string, value: Type): void**
  - Removes a specific value from the cached array for the given key.
- **dropArray(key: string, valueArray: Type[]): Type**
  - Removes all elements from the cached array for the given key that are present in the provided value array. It returns a new array containing the elements that were not dropped.

#### Helper Functions

- **createCompositeKey(...keyParts: string[]): string**
  - Creates a composite key string by joining the provided key parts with a "#" delimiter.
- **splitCompositeKey(key: string): string[]**
  - Splits a composite key string back into its individual parts using the "#" delimiter.

### License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.
