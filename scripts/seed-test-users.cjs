const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function upsertUser(email, name, password, role = "user") {
  const hash = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { name, password: hash, role },
    });
    console.log("Updated user", email);
  } else {
    await prisma.user.create({ data: { name, email, password: hash, role } });
    console.log("Created user", email);
  }
}

async function main() {
  console.log("Seeding test users...");
  await upsertUser("admin@local.test", "Admin User", "adminpass", "admin");
  await upsertUser("owner@local.test", "Vehicle Owner", "ownerpass", "owner");
  await upsertUser(
    "authority@local.test",
    "Authority User",
    "authoritypass",
    "authority"
  );
  await upsertUser("user@local.test", "Regular User", "userpass", "user");
  console.log("\nTest users created/updated:");
  console.log("  admin@local.test  role=admin    password=adminpass");
  console.log("  owner@local.test  role=owner    password=ownerpass");
  console.log("  authority@local.test  role=authority  password=authoritypass");
  console.log("  user@local.test   role=user     password=userpass");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
