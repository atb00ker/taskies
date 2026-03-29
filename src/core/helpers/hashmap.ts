export class HashmapHelper {
  toMap<T>(keyField: keyof T, items: T[]): Map<string, T> {
    return new Map(items.map((item) => [item[keyField] as string, item]));
  }

  union<T>(maps: Map<string, T>[]): Map<string, T> {
    if (maps.length === 0) return new Map();
    if (maps.length === 1) return maps[0];
    const totalEntries: [string, T][] = [];
    for (let i = 0; i < maps.length; i++) {
      totalEntries.push(...maps[i].entries());
    }
    return new Map(totalEntries);
  }

  intersect<T>(maps: Map<string, T>[]): Map<string, T> {
    const result = new Map<string, T>();
    const firstMap = maps[0];
    const remainingMaps = maps.slice(1);

    for (const [key, value] of firstMap.entries()) {
      let isPresentInAll = true;
      for (const map of remainingMaps) {
        if (!map.has(key)) {
          isPresentInAll = false;
          break;
        }
      }
      if (isPresentInAll) {
        result.set(key, value);
      }
    }

    return result;
  }
}
