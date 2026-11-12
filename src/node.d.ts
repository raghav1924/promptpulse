declare namespace NodeJS {
  interface Process {
    argv: string[];
    version: string;
    cwd(): string;
    exit(code?: number): never;
    env: Record<string, string | undefined>;
    platform: string;
    on(event: string, listener: (...args: any[]) => void): this;
  }
}

declare const process: NodeJS.Process;

declare module 'node:path' {
  export function join(...paths: string[]): string;
  export function dirname(p: string): string;
  export function resolve(...paths: string[]): string;
  export function relative(from: string, to: string): string;
  export function basename(p: string, ext?: string): string;
  export function extname(p: string): string;
}

declare module 'node:fs' {
  export function existsSync(p: string): boolean;
  export function readFileSync(p: string, options?: any): string;
  export function writeFileSync(p: string, data: string, options?: any): void;
  export function mkdirSync(p: string, options?: { recursive?: boolean }): string | undefined;
  export function readdirSync(p: string, options?: { withFileTypes?: boolean }): any[];
  export function statSync(p: string): { isDirectory(): boolean; isFile(): boolean };
}

declare module 'node:http' {
  export interface IncomingMessage {
    url?: string;
    method?: string;
    headers: Record<string, string | string[] | undefined>;
    on(event: 'data', listener: (chunk: any) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'error', listener: (err: any) => void): this;
  }
  export interface ServerResponse {
    writeHead(statusCode: number, headers?: Record<string, string>): void;
    setHeader(name: string, value: string): void;
    end(data?: string): void;
  }
  export interface Server {
    listen(port: number, host?: string, callback?: () => void): this;
    listen(port: number, callback?: () => void): this;
    close(callback?: () => void): this;
    on(event: string, listener: (err: any) => void): this;
  }
  export function createServer(handler: (req: IncomingMessage, res: ServerResponse) => void): Server;
}

declare module 'node:url' {
  export class URL {
    constructor(url: string, base?: string);
    pathname: string;
    searchParams: any;
    hostname: string;
    port: string;
    protocol: string;
  }
}

declare module 'node:test' {
  export default function test(name: string, fn: () => void | Promise<void>): void;
  export function describe(name: string, fn: () => void | Promise<void>): void;
  export function it(name: string, fn: () => void | Promise<void>): void;
}

declare module 'node:assert' {
  export function ok(value: unknown, message?: string): void;
  export function strictEqual(actual: unknown, expected: unknown, message?: string): void;
  export function deepStrictEqual(actual: unknown, expected: unknown, message?: string): void;
  export function notStrictEqual(actual: unknown, expected: unknown, message?: string): void;
}

