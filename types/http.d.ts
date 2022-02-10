declare module "types/http" {
  export type HttpResponse<T> = {
    message: string;
    data?: T;
  };
}
