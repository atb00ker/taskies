export type SourceKind = 'local' | 'caldav';

export type SourceAuth = {
  user: string;
  password?: string;
};

export type SourceProperties = {
  id: string;
  name: string;
  kind: SourceKind;
  auth: SourceAuth;
};

export class Source {
  readonly data: SourceProperties;

  constructor(data: SourceProperties) {
    if (!data.name.trim()) {
      throw new Error('Source name cannot be empty.');
    }

    this.data = data;
  }

  toProperties(): SourceProperties {
    return this.data;
  }
}
