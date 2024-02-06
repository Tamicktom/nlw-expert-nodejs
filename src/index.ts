//* Local imports
import { server } from "./http/server";

server.listen({ port: 3333 }).then((address) => {
  console.log(`Server listening on ${address}`);
});
