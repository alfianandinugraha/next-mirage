declare module "types/http" {
  export type HttpResponse<T = undefined> = {
    message: string;
    data?: T;
  };
}
