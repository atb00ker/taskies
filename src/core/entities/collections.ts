export type CollectionProperties = {
  id: string;
  name: string;
  source: string;
};

export interface Collection extends CollectionProperties {
  getCollection(id: string): Promise<Collection | undefined>;
  getCollections(): Promise<Collection[]>;
  createCollection(collection: CollectionProperties): Promise<void>;
  updateCollection(collection: CollectionProperties): Promise<void>;
  deleteCollection(id: string): Promise<void>;
}
