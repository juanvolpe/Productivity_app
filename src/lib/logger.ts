export const logger = {
  error: (message: string, ...args: any[]) => {
    console.error(message, ...args);
  },
  info: (message: string, ...args: any[]) => {
    console.info(message, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(message, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    console.debug('[DEBUG]', message, ...args);
  }
}; 