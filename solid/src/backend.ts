import { json,action } from "@solidjs/router";

export const foo = action(async (count: number) => {
  "use server";
  console.log(count)
  return count
});