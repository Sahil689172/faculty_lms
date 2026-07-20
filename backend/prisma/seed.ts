import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_FACULTY_EMAIL ?? "faculty@example.com")
    .trim()
    .toLowerCase();
  const name = process.env.SEED_FACULTY_NAME?.trim() || "Demo Faculty";
  const password = process.env.SEED_FACULTY_PASSWORD?.trim() || "ChangeMe123!";

  const passwordHash = await hashPassword(password);

  const faculty = await prisma.faculty.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash },
  });

  console.log(`Seeded faculty: ${faculty.email} (id: ${faculty.id})`);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
