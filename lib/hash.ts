// Safe bcrypt wrapper: dynamically imports `bcrypt` and falls back to `bcryptjs`.
// This avoids native-binding import errors during module evaluation in some dev setups.
export async function getBcrypt() {
  try {
    const mod = await import("bcrypt");
    return mod && (mod.default || mod);
  } catch (e) {
    try {
      const mod = await import("bcryptjs");
      return mod && (mod.default || mod);
    } catch (err) {
      console.error(
        "Failed to dynamically import bcrypt and bcryptjs. Install one of them."
      );
      throw new Error(
        "Missing dependency: bcrypt or bcryptjs. Run `pnpm install bcryptjs` or ensure bcrypt is available on this platform."
      );
    }
  }
}

export async function hashPassword(password: string, rounds = 10) {
  const b = await getBcrypt();
  // bcrypt (native) supports promise when callback omitted in modern versions;
  // bcryptjs typically provides callback-style APIs. Normalize to promise.
  if (b.hash.length >= 3) {
    // callback style
    return await new Promise<string>((resolve, reject) => {
      b.hash(password, rounds, (err: any, hashed: string) =>
        err ? reject(err) : resolve(hashed)
      );
    });
  }
  // promise-style
  return await b.hash(password, rounds);
}

export async function comparePassword(password: string, hash: string) {
  const b = await getBcrypt();
  if (b.compare.length >= 3) {
    return await new Promise<boolean>((resolve, reject) => {
      b.compare(password, hash, (err: any, same: boolean) =>
        err ? reject(err) : resolve(same)
      );
    });
  }
  return await b.compare(password, hash);
}

export default { getBcrypt, hashPassword, comparePassword };
