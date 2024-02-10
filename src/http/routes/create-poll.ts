//* Libraries imports
import z from "zod";
import type { FastifyInstance } from "fastify";

//* Local imports
import { p } from "../../lib/prisma";

const createPollSchema = z.object({
  title: z.string().min(1).max(128),
  options: z.array(z.string().min(1).max(128)),
});

export async function createPoll(f: FastifyInstance) {
  f.post("/poll", async (request, response) => {
    const createPollBody = createPollSchema.parse(request.body);

    const poll = await p.poll.create({
      data: {
        title: createPollBody.title,
        options: {
          createMany: {
            data: createPollBody.options.map((option) => ({
              title: option,
            })),
          },
        },
      },
    });

    return response.status(201).send(poll);
  });
}
