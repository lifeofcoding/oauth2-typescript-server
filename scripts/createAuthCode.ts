import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

const getRandomBytes = () => {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.randomBytes(256, (err, buf) => {
      if (err) return reject(err);
      console.log(`${buf.length} bytes of random data: ${buf.toString("hex")}`);
      resolve(buf);
    });
  });
};

async function main() {
  // ... you will write your Prisma Client queries here

  const buffer = await getRandomBytes();
  const authorizationCode = crypto
    .createHash("sha1")
    .update(buffer)
    .digest("hex");

  const date = new Date();
  date.setDate(date.getDate() + 5);
  const result = await prisma.authorizationCode.create({
    data: {
      authorizationCode,
      expiresAt: date,
      clientId: "clientId",
      userId: 1,
    },
  });
  console.log("Result", result);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
