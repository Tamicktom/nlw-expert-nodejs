//* Libraries imports
import fastify from "fastify";

const server = fastify();

server.get("/", async (request, reply) => {
  return { hello: "world" };
});

export { server };
