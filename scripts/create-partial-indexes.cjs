const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function run() {
  try {
    console.log(
      "Creating partial unique index on Emission.sampleId (only documents where sampleId exists)"
    );
    const cmd = {
      createIndexes: "Emission",
      indexes: [
        {
          key: { sampleId: 1 },
          name: "Emission_sampleId_partial",
          unique: true,
          partialFilterExpression: { sampleId: { $exists: true } },
        },
      ],
    };
    const res = await prisma.$runCommandRaw(cmd);
    console.log("Index creation result:", res);
  } catch (err) {
    console.error("Failed to create partial index:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

run();
