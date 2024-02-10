//* Libraries imports
import z from "zod";
import type { FastifyInstance } from "fastify";

//* Local imports
import { p } from "../../lib/prisma";

const getPollParamsSchema = z.object({
  pollId: z.string().uuid(),
});

export async function getPoll(f: FastifyInstance) {
  f.get("/poll/:pollId", async (request, response) => {
    const getPollParams = getPollParamsSchema.parse(request.params);

    const poll = await p.poll.findUnique({
      where: {
        id: getPollParams.pollId,
      },
      select: {
        id: true,
        title: true,
        options: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return response.send(poll);
  });
}
