import { useParams } from "@solidjs/router";

export default function HelloPage() {
  const params = useParams();
  return (
    <main>
      <h1>Hello, {params.name || "stranger"}!</h1>
      <p>Welcome to the greeting page.</p>
    </main>
  );
}