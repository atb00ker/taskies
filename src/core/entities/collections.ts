export type CollectionProperties = {
  id: string;
  name: string;
  source: string;
};

export class Collection {
  readonly data: CollectionProperties;

  constructor(data: CollectionProperties) {
    if (!data.name.trim()) {
      throw new Error('Collection name cannot be empty.');
    }

    this.data = data;
  }

  toProperties(): CollectionProperties {
    return this.data;
  }
}
