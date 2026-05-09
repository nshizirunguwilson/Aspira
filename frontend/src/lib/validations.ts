import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[\d]{9,13}$/, "Phone must be 9–13 digits");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

export const idNumberSchema = z
  .string()
  .trim()
  .min(5, "ID number must be at least 5 characters");
