import { json,action } from "@solidjs/router";

export const foo = action(async (count: number) => {
  "use server";
  console.log(count)
  return count
});

export const getTime = action(async () => {
  "use server";
  console.log("time on server")
  const now = new Date().toLocaleString();
  return now;
})