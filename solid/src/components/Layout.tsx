import type { JSX } from "solid-js";

export default function Layout(props: { children: JSX.Element }) {
  return (
    <>
      <nav class="flex items-center justify-between flex-wrap bg-gray-800 p-4 shadow-md">
        <div class="text-white font-bold text-xl">MyApp</div>
        <div class="space-x-4">
          <a href="/" class="text-gray-300 hover:text-white transition-colors">Home</a>
          <a href="/about" class="text-gray-300 hover:text-white transition-colors">About</a>
          <a href="/counter" class="text-gray-300 hover:text-white transition-colors">Counter</a>
          <a href="/hello/World" class="text-gray-300 hover:text-white transition-colors">Hello</a>
          <a href="/time" class="text-gray-300 hover:text-white transition-colors">Time</a>
        </div>
      </nav>
      <div>
        {props.children}
      </div>
    </>
  );
}