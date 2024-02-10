//* Libraries imports
import fastify from "fastify";
import cookie from "@fastify/cookie";

//* Local imports
import { createPoll } from "./routes/create-poll";
import { getPoll } from "./routes/get-poll";
import { voteOnPoll } from "./routes/vote-on-poll";

const server = fastify();

server.register(cookie, {
  secret: "bjnioasdvfiuobawfbuiasvbaeifyuvbaeiucvbwquivbwaerih",
  hook: "onRequest",
});

server.register(createPoll);
server.register(getPoll);
server.register(voteOnPoll);

export { server };
