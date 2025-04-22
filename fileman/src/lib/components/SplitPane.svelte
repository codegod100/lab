<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  
  export let direction: 'horizontal' | 'vertical' = 'horizontal';
  export let initialSplit = 50; // Percentage
  export let minSize = 20; // Minimum size in percentage
  export let resizable = true;
  
  let container: HTMLElement;
  let divider: HTMLElement;
  let isDragging = false;
  let splitPercentage = initialSplit;
  
  const dispatch = createEventDispatcher();
  
  function startDrag(e: MouseEvent) {
    if (!resizable) return;
    
    isDragging = true;
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    
    // Prevent text selection during drag
    e.preventDefault();
  }
  
  function onDrag(e: MouseEvent) {
    if (!isDragging) return;
    
    const containerRect = container.getBoundingClientRect();
    
    if (direction === 'horizontal') {
      const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      splitPercentage = Math.max(minSize, Math.min(100 - minSize, percentage));
    } else {
      const percentage = ((e.clientY - containerRect.top) / containerRect.height) * 100;
      splitPercentage = Math.max(minSize, Math.min(100 - minSize, percentage));
    }
    
    dispatch('resize', { splitPercentage });
  }
  
  function stopDrag() {
    isDragging = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
  
  onMount(() => {
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    
    return () => {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
  });
</script>

<div 
  class="split-pane {direction}" 
  bind:this={container}
  style="--split-percentage: {splitPercentage}%;"
>
  <div class="pane first">
    <slot name="first"></slot>
  </div>
  
  {#if resizable}
    <div 
      class="divider {direction}" 
      bind:this={divider}
      on:mousedown={startDrag}
    ></div>
  {/if}
  
  <div class="pane second">
    <slot name="second"></slot>
  </div>
</div>

<style>
  .split-pane {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  
  .split-pane.horizontal {
    flex-direction: row;
  }
  
  .split-pane.vertical {
    flex-direction: column;
  }
  
  .pane {
    overflow: auto;
  }
  
  .pane.first {
    flex: 0 0 var(--split-percentage);
  }
  
  .pane.second {
    flex: 1;
  }
  
  .divider {
    background-color: #ccc;
    transition: background-color 0.2s;
  }
  
  .divider:hover {
    background-color: #aaa;
  }
  
  .divider.horizontal {
    width: 5px;
    cursor: col-resize;
  }
  
  .divider.vertical {
    height: 5px;
    cursor: row-resize;
  }
  
  @media (prefers-color-scheme: dark) {
    .divider {
      background-color: #444;
    }
    
    .divider:hover {
      background-color: #666;
    }
  }
</style>
