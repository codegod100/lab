import { codeToHtml } from "shiki";
import type { PageLoad } from "./$types";
const theme = "catppuccin-mocha";
export const load: PageLoad = async () => {
  const code = await codeToHtml(
    `function myFunction() {
  console.log("Hello, world!");
}`,
    { lang: "javascript", theme },
  );

  const code2 = await codeToHtml(`println!("Hello, world!");`, {
    lang: "rust",
    theme,
  });
  return { code, code2 };
};
