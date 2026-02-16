
const BASE_URL = "http://localhost:4001";
const EMAIL = "admin@example.com";
const PASSWORD = "Password123!@#";
const NAME = "Admin User";

async function main() {
  console.log(`Targeting ${BASE_URL}...`);

  // 1. Sign Up
  console.log(`\n--- Attempting Sign Up ---`);
  try {
    const signUpRes = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD, name: NAME }),
    });

    const signUpData = await signUpRes.json();
    
    if (!signUpRes.ok) {
        console.error("Sign Up Response:", signUpRes.status, signUpData);
        if (signUpData.message !== "User already exists") { // Adjust based on actual API error
             // Proceed to sign in
        }
    } else {
        console.log("Sign Up Successful:", signUpData);
    }
  } catch (e) {
      console.error("Sign Up Error:", e);
  }

  // 2. Sign In
  console.log(`\n--- Attempting Sign In ---`);
  try {
    const signInRes = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });

    const signInData = await signInRes.json();

    if (!signInRes.ok) {
        console.error("Sign In Failed:", signInRes.status, signInData);
        return;
    }
    
    console.log("Sign In Successful!");
    
    // BetterAuth returns token in body or cookies?
    // Usually standard is body for API clients, but checking headers too.
    const setCookie = signInRes.headers.get("set-cookie");
    // console.log("Set-Cookie Header:", setCookie);
    
    // In better-auth, the response usually contains the session and user object.
    // The token might differ based on config.
    console.log("Response Body:", JSON.stringify(signInData, null, 2));

    // Inspect for token
    const token = signInData?.token || signInData?.session?.token;
    
    if (token) {
        console.log("\n✅ Authentication Successful!");
        console.log("Use this header in Apollo Sandbox / GraphQL Clients:");
        console.log(`Authorization: Bearer ${token}`);
    } else {
        console.log("\n⚠️  Token not found in response body directly.");
        console.log("You may need to use Cookies for authentication if token is not explicit.");
        if (setCookie) console.log("Cookies received:", setCookie);
    }

  } catch (e) {
      console.error("Sign In Error:", e);
  }
}

main();
