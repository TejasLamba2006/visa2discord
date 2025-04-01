const internalCache: Record<string, any> = {};

async function wrapAndStoreCoroutine(
  cache: Record<string, any>,
  key: string,
  coro: Promise<any>
): Promise<any> {
  const value = await coro;
  cache[key] = value;
  return value;
}

function wrapNewCoroutine(value: any): () => Promise<any> {
  async function newCoroutine() {
    return value;
  }
  return newCoroutine;
}

function clearCache(): void {
  Object.keys(internalCache).forEach((key) => delete internalCache[key]);
}

function cache() {
  return function decorator(func: (...args: any[]) => any) {
    function makeKey(args: any[], kwargs: Record<string, any>): string {
      const key = [`${func.constructor.name}.${func.name}`];
      key.push(...args.map((arg) => JSON.stringify(arg)));

      Object.entries(kwargs).forEach(([k, v]) => {
        key.push(JSON.stringify(k));
        key.push(JSON.stringify(v));
      });

      return key.join(":");
    }

    function wrapper(...args: any[]): Promise<any> {
      const kwargs = args.pop() as Record<string, any>;
      const key = makeKey(args, kwargs);

      if (internalCache.hasOwnProperty(key)) {
        return wrapNewCoroutine(internalCache[key])();
      } else {
        const value = func(...args, kwargs);
        return wrapAndStoreCoroutine(internalCache, key, value);
      }
    }

    wrapper.cache = internalCache;
    wrapper.clearCache = clearCache;
    return wrapper;
  };
}

export default cache;
