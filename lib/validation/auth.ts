import { z } from "zod";
export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");
export const passwordSchema = z.string().min(10, "Use at least 10 characters.").max(128).refine(v => /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v), "Mix upper and lower case letters with a number.");
export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(80),
  email: emailSchema, password: passwordSchema, confirm: z.string(),
  terms: z.literal("on", { errorMap: () => ({ message: "Accept the Terms and Privacy Policy to continue." }) }),
}).refine(d => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match." });
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password."), remember: z.string().optional() });
export function passwordStrength(v: string) {
  let s = 0; if (v.length >= 10) s++; if (v.length >= 14) s++; if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++;
  return Math.min(4, s) as 0 | 1 | 2 | 3 | 4;
}
