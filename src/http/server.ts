//* Libraries imports
import z from "zod";
import { PrismaClient } from "@prisma/client";
import fastify from "fastify";

const p = new PrismaClient();
const server = fastify();

const createPollSchema = z.object({
  title: z.string().min(1).max(128),
});

server.post("/poll", async (request, response) => {
  const createPollBody = createPollSchema.parse(request.body);

  const poll = await p.poll.create({
    data: {
      title: createPollBody.title,
    },
  });

  return response.status(201).send(poll);
});

export { server };
