//* Libraries imports
import z from "zod";
import type { FastifyInstance } from "fastify";

//* Local imports
import { p } from "../../lib/prisma";
import { redis } from "../../lib/redis";

const voteOnPollBodySchema = z.object({
  pollOptionId: z.string().uuid(),
});

const voteOnPollParamsSchema = z.object({
  pollId: z.string().uuid(),
});

export async function voteOnPoll(f: FastifyInstance) {
  f.post("/poll/:pollId/votes", async (request, response) => {
    const voteOnPollParams = voteOnPollParamsSchema.parse(request.params);
    const voteOnPollBody = voteOnPollBodySchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (sessionId) {
      const userPreviousVoteOnPoll = await p.vote.findUnique({
        where: {
          sessionId_pollId: {
            sessionId: sessionId,
            pollId: voteOnPollParams.pollId,
          },
        },
      });

      if (userPreviousVoteOnPoll) {
        if (
          userPreviousVoteOnPoll.pollOptionId !== voteOnPollBody.pollOptionId
        ) {
          await p.vote.delete({
            where: {
              id: userPreviousVoteOnPoll.id,
            },
          });

          await redis.zincrby(
            `poll:${voteOnPollParams.pollId}`,
            -1,
            userPreviousVoteOnPoll.pollOptionId
          );
        }

        return response.status(400).send({
          message: "You have already voted on this poll",
        });
      }
    }

    if (!sessionId) {
      sessionId = crypto.randomUUID();

      response.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        signed: true,
        httpOnly: true,
      });
    }

    const vote = await p.vote.create({
      data: {
        sessionId: sessionId,
        pollOptionId: voteOnPollBody.pollOptionId,
        pollId: voteOnPollParams.pollId,
      },
    });

    await redis.zincrby(
      `poll:${voteOnPollParams.pollId}`,
      1,
      voteOnPollBody.pollOptionId
    );

    return response.status(201).send(vote);
  });
}
