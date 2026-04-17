import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    // Find the old user
    const oldUser = await prisma.user.findUnique({
      where: { email: "john@doe.com" }
    });

    if (!oldUser) {
      console.log("❌ Old user not found");
      return;
    }

    console.log("✓ Found old user:", oldUser.email);

    // Update the user with new email and password
    const updatedUser = await prisma.user.update({
      where: { id: oldUser.id },
      data: {
        email: "uchemenyeonwuekwe@gmail.com",
        password: await hash("Dikeoha042$100%", 10),
        name: "App Owner",
        businessName: "CashFlowIQ",
        businessType: "SaaS"
      }
    });

    console.log("✅ User migrated successfully!");
    console.log("   Old email: john@doe.com");
    console.log("   New email:", updatedUser.email);
    console.log("   Name: App Owner");
    console.log("   Subscription: Pro (Free)");
    console.log("   Admin: Yes");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
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
