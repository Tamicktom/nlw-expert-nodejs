//* Libraries imports
import z from "zod";
import type { FastifyInstance } from "fastify";

//* Local imports
import { p } from "../../lib/prisma";
import { redis } from "../../lib/redis";

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

    if (!poll) return response.status(404).send({ message: "Poll not found" });

    const result = await redis.zrange(`poll:${poll.id}`, 0, -1, "WITHSCORES");

    const votes = result.reduce((acc, cur, idx) => {
      if (idx % 2 === 0) {
        const score = result[idx + 1];
        Object.assign(acc, { [cur]: parseInt(score) });
      }

      return acc;
    }, {} as Record<string, number>);

    const responseBody = {
      poll: {
        id: poll.id,
        title: poll.title,
        options: poll.options.map((option) => ({
          id: option.id,
          title: option.title,
          votes: votes[option.id] || 0,
        })),
      },
    };

    return response.send(responseBody);
  });
}
