const internalCache = {};

function wrapAndStoreCoroutine(cache, key, coro) {
  async function func() {
    const value = await coro;
    cache[key] = value;
    return value;
  }
  return func();
}

function wrapNewCoroutine(value) {
  async function newCoroutine() {
    return value;
  }
  return newCoroutine;
}

function clearCache() {
  Object.keys(internalCache).forEach(key => delete internalCache[key]);
}

function cache() {
  return function decorator(func) {
    function makeKey(args, kwargs) {
      const key = [`${func.constructor.name}.${func.name}`];
      key.push(...args.map(arg => JSON.stringify(arg)));

      Object.entries(kwargs).forEach(([k, v]) => {
        key.push(JSON.stringify(k));
        key.push(JSON.stringify(v));
      });

      return key.join(':');
    }

    function wrapper(...args) {
      const kwargs = args.pop();
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

module.exports = cache;