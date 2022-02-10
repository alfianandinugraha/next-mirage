import users from "@data/users";
import { createServer, Model, Response } from "miragejs";

const makeServer = () => {
  return createServer({
    models: {
      user: Model,
    },
    seeds(server) {
      server.loadFixtures();
    },
    fixtures: {
      users,
    },
    routes() {
      this.namespace = "api";

      this.get(
        "/users",
        (schema, request) => {
          if (request.queryParams.error) return new Response(400);
          return {
            message: "Fetch users success",
            data: request.queryParams.empty ? [] : schema.all("user").models,
          };
        },
        { timing: 1000 }
      );
    },
  });
};

export default makeServer;
