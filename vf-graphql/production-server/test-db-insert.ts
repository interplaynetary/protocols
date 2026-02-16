
import { db } from './src/db';
import { users, accounts } from './src/db/schema';
import { eq } from 'drizzle-orm';
import { betterAuth } from 'better-auth'; // Import to use hashing if available or just raw?
// Actually, better-auth manages passwords. If I insert raw, better-auth won't know the hash.
// But I can try to insert just the USER part to see if constraints pass.

async function main() {
  const email = "manual@example.com";
  
  console.log("Checking if user exists...");
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
      console.log("User already exists:", existing[0]);
      // Delete to retry?
      // await db.delete(users).where(eq(users.email, email));
      return;
  }

  console.log("Inserting user manually...");
  try {
    const ret = await db.insert(users).values({
        email,
        emailVerified: true,
        name: "Manual User",
        // password: "rawpassword" // Drizzle schema has it now.
        // But better-auth won't accept raw password for login usually.
        // Just testing INSERT capability.
        password: "hashed_placeholder", 
    }).returning();
    
    console.log("Insert successful:", ret);
  } catch (err) {
      console.error("Insert failed:", err);
  }
}

main().then(() => {
    process.exit(0);
});
