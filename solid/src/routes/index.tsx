import { Title } from "@solidjs/meta";
import Counter from "~/components/Counter";



export default  function Home() {
  return (
    <main class="max-w-4xl mx-auto p-6 md:p-10 lg:p-16 bg-white dark:bg-gray-900 rounded-2xl shadow-lg mt-10">
      <Title>Hello World</Title>
      <h1 class="text-4xl md:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
        Hello world!
      </h1>
      <div class="mb-6 p-4 border border-dashed border-gray-300 rounded-lg hover:shadow transition-shadow duration-300">
        <Counter />
      </div>
      <p class="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
        Visit{" "}
        <a
          href="https://start.solidjs.com"
          target="_blank"
          class="text-blue-600 hover:text-blue-800 underline font-medium"
        >
          start.solidjs.com
        </a>{" "}
        to learn how to build SolidStart apps.
      </p>
    </main>
  );
}
