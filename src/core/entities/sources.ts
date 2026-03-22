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

export interface Source extends SourceProperties {
  /** Source */
  getSource(id: string): Promise<Source | undefined>;
  getSources(): Promise<Source[]>;
  createSource(source: SourceProperties): Promise<void>;
  updateSource(id: string, source: SourceProperties): Promise<void>;
  deleteSource(id: string): Promise<void>;

  /** Authentication  */
  login(): Promise<void>;
  logout(): Promise<void>;
}
