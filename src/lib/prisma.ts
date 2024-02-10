//* Libraries imports
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient({
  log: ["query"],
});

export {p};
