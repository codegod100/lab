import { createResource } from "solid-js";
import { useAction, useSubmission } from "@solidjs/router";
import { getTime } from "~/backend";
export default function TimePage() {
    const time = useSubmission(getTime);
    const setTime = useAction(getTime);
    setTime()

  return (
    <main>
      <h1>Current Server Time</h1>
      <p>{time.result}</p>
    </main>
  );
}