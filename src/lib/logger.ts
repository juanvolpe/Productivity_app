export const logger = {
  error: (message: string, error?: any) => {
    console.error('[ERROR]', message, error);
  },
  info: (message: string, ...args: any[]) => {
    console.log('[INFO]', message, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn('[WARN]', message, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    console.debug('[DEBUG]', message, ...args);
  }
}; 