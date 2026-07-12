// Temporary type declaration for web-push
// This allows the build to proceed until @types/web-push is properly installed
declare module "web-push" {
  export function sendNotification(
    subscription: any,
    payload: string | Buffer,
    options?: any,
  ): Promise<any>;

  export function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;

  export function generateVAPIDKeys(): {
    publicKey: string;
    privateKey: string;
  };
}
