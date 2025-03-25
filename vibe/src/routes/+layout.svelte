<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="min-h-screen bg-[#1e1e2e]">
	<div class="py-6">
		{@render children()}
	</div>
</div>
