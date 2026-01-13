import { Injectable, ConsoleLogger } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

@Injectable()
export class MyLoggerService extends ConsoleLogger {
  private logPath = path.join(process.cwd(), 'logs', 'myLogFile.log');

  private async logToFile(entry: string) {
    const logDir = path.dirname(this.logPath);

    try {
      await fsPromises.mkdir(logDir, { recursive: true });
      await fsPromises.appendFile(this.logPath, entry + '\n');
    } catch (e) {
      super.error(`Logger failed: ${e.message}`);
    }
  }

  private format(entry: any, context?: string) {
    const timestamp = new Date().toISOString();
    return `${timestamp} [${context ?? 'App'}] ${entry}`;
  }

  log(message: any, context?: string) {
    const entry = this.format(message, context);
    this.logToFile(entry);
    super.log(message, context);
  }

  error(message: any, stackOrContext?: string) {
    const entry = this.format(message, stackOrContext);
    this.logToFile(entry);
    super.error(message, stackOrContext);
  }

  warn(message: any, context?: string) {
    const entry = this.format(message, context);
    this.logToFile(entry);
    super.warn(message, context);
  }
}
