import prisma from "../lib/prisma";

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
          partialFilterExpression: { sampleId: { $exists: true, $ne: null } },
        },
      ],
    };
    const res = await prisma.$runCommandRaw(cmd);
    console.log("Index creation result:", res);
  } catch (err) {
    console.error("Failed to create partial index:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
