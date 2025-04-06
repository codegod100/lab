import { createSignal, createResource,Show } from "solid-js";
import { foo } from "~/backend";
import { useAction, useSubmission } from "@solidjs/router";
export default function Counter() {
	const [count, setCount] = createSignal(0);
	const setFoo = useAction(foo);
	setFoo(0)
	const serverCount = useSubmission(foo);
	return (
		<button
		class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-all duration-200 focus:outline-none focus:ring focus:ring-blue-300"
		onClick={() => {
			setCount(count() + 1);
			setFoo(count())
			}}
			type="button"
		>
			Clicks: {count()} <Show when={serverCount.result}>blicks: {serverCount.result} </Show>
		</button>
	);
}
