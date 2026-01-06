// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
export function joinStrings(strings: (string | undefined | null)[], separator = " ") {
  return strings.filter(Boolean).join(separator);
}
export function isEmpty(value: unknown) {
  return value === undefined || value === null || value === "";
}
