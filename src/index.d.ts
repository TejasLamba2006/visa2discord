declare module "visa2discord" {
  export function passGen(length: number): string;
  export function checkUpdate(): Promise<void>;
  export function splitMessageRegex(
    text: string,
    options?: {
      maxLength?: number;
      regex?: RegExp;
      prepend?: string;
      append?: string;
    }
  ): string[];
  export function cleanCode(text: string): string;
  export function generateActivity(
    client: any,
    channel: any,
    options: { custom?: string; name?: string }
  ): Promise<object>;
  export function quickExport(data: any): string;
  export function exportChat(chatId: string): string;
  export function rawExport(data: any): string;
  export class Transcript {
    constructor(data: any);
    generate(): string;
  }
  export function prettyBytes(
    bytes: number,
    options?: {
      bits?: boolean;
      signed?: boolean;
      locale?: string;
    }
  ): string;
}
