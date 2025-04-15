import { d as slot } from "../../chunks/index.js";
function _layout($$payload, $$props) {
  let theme = "light";
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme") || "light";
    theme = savedTheme;
    document.documentElement.setAttribute("data-theme", savedTheme);
  }
  $$payload.out += `<div class="fixed top-4 right-4 z-50"><button class="btn btn-primary">`;
  if (theme === "light") {
    $$payload.out += "<!--[-->";
    $$payload.out += `Dark Mode`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `Light Mode`;
  }
  $$payload.out += `<!--]--></button></div> <div class="min-h-screen bg-base-100 text-base-content"><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></div>`;
}
export {
  _layout as default
};
