import users from "@data/users";
import { createServer, Model, Response } from "miragejs";
import { ModelDefinition } from "miragejs/-types";
import { User } from "types/model";

const makeServer = () => {
  return createServer<{ user: ModelDefinition<Omit<User, "id">> }, any>({
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

      this.post(
        "/users",
        (schema, request) => {
          const { fullName, email }: Omit<User, "id"> = JSON.parse(
            request.requestBody
          );

          if (!fullName || !email)
            return new Response(
              401,
              {},
              {
                message: "Invalid data",
              }
            );

          const payload: any = { fullName, email };
          schema.create("user", payload);

          return {
            message: "Store user success",
          };
        },
        { timing: 2000 }
      );

      this.delete(
        "/users/:id",
        (schema, request) => {
          const id = request.params.id;
          const user = schema.find("user", id);

          if (!user)
            return new Response(404, {}, { message: "User not found" });

          user.destroy();

          return {
            message: "Delete user successfully",
          };
        },
        { timing: 2000 }
      );
    },
  });
};

export default makeServer;
