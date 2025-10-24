declare module 'ketcher-standalone' {
  export interface StructServiceProvider {
    mode: 'standalone';
    createStructService: () => Promise<any>;
  }
  
  export class StandaloneStructServiceProvider implements StructServiceProvider {
    constructor();
    mode: 'standalone';
    createStructService: () => Promise<any>;
  }
}
