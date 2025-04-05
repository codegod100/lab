<script lang="ts">
  import { onMount } from 'svelte';
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let drawing = false;
  let currentTool = 'pencil';
  let currentColor = '#000000';
  let lastX = 0;
  let lastY = 0;
  let startX = 0;
  let startY = 0;

  // Menu state
  let isFileMenuOpen = false;
  let isEditMenuOpen = false;
  let isViewMenuOpen = false;
  let isImageMenuOpen = false;
  let isColorsMenuOpen = false;
  let isHelpMenuOpen = false;
  let showAboutDialog = false;

  const colors = [
    '#000000', '#808080', '#800000', '#FF0000',
    '#008000', '#00FF00', '#000080', '#0000FF',
    '#808000', '#FFFF00', '#008080', '#00FFFF',
    '#800080', '#FF00FF', '#C0C0C0', '#FFFFFF',
    '#FFFF80', '#80FF80', '#80FFFF', '#FF80FF',
    '#FF8040', '#FF8000', '#FFBF00', '#BFFF00'
  ];

  function selectTool(tool: string) {
    currentTool = tool;
  }

  function selectColor(color: string) {
    currentColor = color;
    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;
  }

  function startDrawing(event: MouseEvent) {
    drawing = true;
    [startX, startY] = getMousePos(event);
    [lastX, lastY] = [startX, startY]; // Initialize last position

    if (currentTool === 'fill') {
      floodFill(Math.floor(startX), Math.floor(startY));
      drawing = false; // Fill is instantaneous
    }
  }

  function stopDrawing(event: MouseEvent) {
    if (!drawing) return;
    drawing = false;
    const [endX, endY] = getMousePos(event);

    // Finalize shapes
    if (currentTool === 'line') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else if (currentTool === 'rectangle') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    }
  }

  function draw(event: MouseEvent) {
    if (!drawing) return;
    const [x, y] = getMousePos(event);

    // Handle continuous drawing tools
    if (currentTool === 'pencil') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === 'brush') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 5; // Brush is thicker than pencil
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    // Update last position for continuous drawing tools
    [lastX, lastY] = [x, y];
  }

  function getMousePos(event: MouseEvent): [number, number] {
    const rect = canvas.getBoundingClientRect();
    return [
      event.clientX - rect.left,
      event.clientY - rect.top
    ];
  }

  // Basic Flood Fill Algorithm (4-way)
  function floodFill(x: number, y: number) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const targetColor = getColorAtPixel(data, x, y); // Color of the pixel clicked
    const fillColor = hexToRgba(currentColor); // Color to fill with

    // If the target color is the same as the fill color, do nothing
    if (colorsMatch(targetColor, fillColor)) return;

    const stack: [number, number][] = [[x, y]]; // Stack for pixels to check

    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!; // Get the next pixel from the stack

      // Boundary checks (though should be handled by initial check and neighbor logic)
      if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) continue;

      const currentColorAtPixel = getColorAtPixel(data, cx, cy);

      // If the current pixel's color is not the target color, skip it
      if (!colorsMatch(currentColorAtPixel, targetColor)) continue;

      // Set the pixel to the fill color
      setColorAtPixel(data, cx, cy, fillColor);

      // Add neighbors to the stack
      stack.push([cx - 1, cy]); // West
      stack.push([cx + 1, cy]); // East
      stack.push([cx, cy - 1]); // North
      stack.push([cx, cy + 1]); // South
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function getColorAtPixel(data: Uint8ClampedArray, x: number, y: number): [number, number, number, number] {
    const index = (y * canvas.width + x) * 4;
    return [
      data[index],
      data[index + 1],
      data[index + 2],
      data[index + 3]
    ];
  }

  function setColorAtPixel(data: Uint8ClampedArray, x: number, y: number, color: [number, number, number, number]) {
    const index = (y * canvas.width + x) * 4;
    data[index] = color[0];
    data[index + 1] = color[1];
    data[index + 2] = color[2];
    data[index + 3] = color[3];
  }

  function colorsMatch(a: [number, number, number, number], b: [number, number, number, number]) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
  }

  function hexToRgba(hex: string): [number, number, number, number] {
    const bigint = parseInt(hex.slice(1), 16);
    return [
      (bigint >> 16) & 255,
      (bigint >> 8) & 255,
      bigint & 255,
      255
    ];
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  });

  function closeAllMenus() {
    isFileMenuOpen = false;
    isEditMenuOpen = false;
    isViewMenuOpen = false;
    isImageMenuOpen = false;
    isColorsMenuOpen = false;
    isHelpMenuOpen = false;
  }

  function toggleMenu(menu: 'file' | 'edit' | 'view' | 'image' | 'colors' | 'help') {
    const currentlyOpen = getMenuState(menu);
    closeAllMenus(); // Close others first
    switch (menu) {
      case 'file': isFileMenuOpen = !currentlyOpen; break;
      case 'edit': isEditMenuOpen = !currentlyOpen; break;
      case 'view': isViewMenuOpen = !currentlyOpen; break;
      case 'image': isImageMenuOpen = !currentlyOpen; break;
      case 'colors': isColorsMenuOpen = !currentlyOpen; break;
      case 'help': isHelpMenuOpen = !currentlyOpen; break;
    }
  }

  function getMenuState(menu: 'file' | 'edit' | 'view' | 'image' | 'colors' | 'help'): boolean {
     switch (menu) {
      case 'file': return isFileMenuOpen;
      case 'edit': return isEditMenuOpen;
      case 'view': return isViewMenuOpen;
      case 'image': return isImageMenuOpen;
      case 'colors': return isColorsMenuOpen;
      case 'help': return isHelpMenuOpen;
      default: return false;
    }
  }

  // Close menus when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menubar-item')) {
      closeAllMenus();
    }
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Add global listener
    document.addEventListener('click', handleClickOutside);
    return () => {
      // Cleanup listener
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div class="window" style="max-width: 100%; width: 90%; height: 90vh; margin: 20px auto; display: flex; flex-direction: column;">
  <div class="title-bar">
    <div class="title-bar-text">untitled - Paint</div>
    <div class="title-bar-controls">
      <button aria-label="Minimize"></button>
      <button aria-label="Maximize"></button>
      <button aria-label="Close"></button>
    </div>
  </div>
  <div class="window-body" style="padding: 0; flex: 1; display: flex; flex-direction: column; overflow: hidden;">
    <menu role="menubar" class="menubar" style="margin: 0; padding: 2px 4px; display: flex; gap: 0px; border-bottom: 1px solid gray; background: #C0C0C0; list-style: none; font-family: sans-serif; font-size: 14px; position: relative; z-index: 10;">
      <li class="menubar-item" on:click|stopPropagation={() => toggleMenu('file')}>
        File
        {#if isFileMenuOpen}
        <ul class="menu dropdown">
          <li>New</li>
          <li>Open...</li>
          <li>Save</li>
          <li>Save As...</li>
          <li class="separator"></li>
          <li>Exit</li>
        </ul>
        {/if}
      </li>
      <li class="menubar-item" on:click|stopPropagation={() => toggleMenu('edit')}>
        Edit
        {#if isEditMenuOpen}
        <ul class="menu dropdown">
          <li>Undo</li>
          <li class="separator"></li>
          <li>Cut</li>
          <li>Copy</li>
          <li>Paste</li>
        </ul>
        {/if}
      </li>
       <li class="menubar-item" on:click|stopPropagation={() => toggleMenu('view')}>
        View
        {#if isViewMenuOpen}
        <ul class="menu dropdown">
          <li>Zoom</li>
          <li>View Bitmap</li>
        </ul>
        {/if}
      </li>
       <li class="menubar-item" on:click|stopPropagation={() => toggleMenu('image')}>
        Image
         {#if isImageMenuOpen}
        <ul class="menu dropdown">
          <li>Flip/Rotate</li>
          <li>Stretch/Skew</li>
          <li>Invert Colors</li>
          <li>Attributes...</li>
          <li>Clear Image</li>
        </ul>
        {/if}
      </li>
       <li class="menubar-item" on:click|stopPropagation={() => toggleMenu('colors')}>
        Colors
         {#if isColorsMenuOpen}
        <ul class="menu dropdown">
          <li>Edit Colors...</li>
        </ul>
        {/if}
      </li>
       <li class="menubar-item" on:click|stopPropagation={() => toggleMenu('help')}>
        Help
         {#if isHelpMenuOpen}
        <ul class="menu dropdown">
          <li>Help Topics</li>
          <li class="separator"></li>
          <li on:click={() => { showAboutDialog = true; closeAllMenus(); }}>About Paint</li>
        </ul>
        {/if}
      </li>
    </menu>

    <div style="display: flex; flex: 1; overflow: hidden;">
      <div class="toolbar" style="width: 60px; background: #C0C0C0; border-right: 1px solid gray; display: flex; flex-direction: column; flex-shrink: 0; align-items: center; padding-top: 4px;">
        <div class="tool-button" on:click={() => selectTool('select')} class:selected={currentTool === 'select'} title="Select">
          <div>🔲</div><small>Select</small>
        </div>
        <div class="tool-button" on:click={() => selectTool('free-select')} class:selected={currentTool === 'free-select'} title="Free-Form Select">
          <div style="color: orange;">✂️</div><small>Free</small>
        </div>
        <div class="tool-button" on:click={() => selectTool('eraser')} class:selected={currentTool === 'eraser'} title="Eraser">
          <div style="color: red;">🩹</div><small>Eraser</small>
        </div>
        <div class="tool-button" on:click={() => selectTool('fill')} class:selected={currentTool === 'fill'} title="Fill">
          <div style="color: blue;">🪣</div><small>Fill</small>
        </div>
        <div class="tool-button" on:click={() => selectTool('picker')} class:selected={currentTool === 'picker'} title="Color Picker">
          <div style="color: purple;">🎨</div><small>Picker</small>
        </div>
        <div class="tool-button" on:click={() => selectTool('magnifier')} class:selected={currentTool === 'magnifier'} title="Magnifier">
          <div style="color: green;">🔍</div><small>Zoom</small>
        </div>
        <div class="tool-button" on:click={() => selectTool('pencil')} class:selected={currentTool === 'pencil'} title="Pencil">
          <div style="color: black;">✏️</div><small>Pencil</small>
        </div>
        <div class="tool-button" on:click={() => selectTool('brush')} class:selected={currentTool === 'brush'} title="Brush">
          <div style="color: brown;">🖌️</div><small>Brush</small>
        </div>
        <div class="tool-button" on:click={() => selectTool('airbrush')} class:selected={currentTool === 'airbrush'} title="Airbrush (not implemented)">
          <div style="color: gray;">💨</div><small>Air</small>
        </div>
        <div class="tool-button" on:click={() => selectTool('text')} class:selected={currentTool === 'text'} title="Text (not implemented)">
          <div style="color: black;">🔤</div><small>Text</small>
        </div>
        <div class="tool-button" on:click={() => selectTool('line')} class:selected={currentTool === 'line'} title="Line">
          <div style="color: black;">📏</div><small>Line</small>
        </div>
        <div class="tool-button" on:click={() => selectTool('curve')} class:selected={currentTool === 'curve'} title="Curve (not implemented)">
          <div style="color: black;">〰️</div><small>Curve</small>
        </div>
        <div class="tool-button" on:click={() => selectTool('rectangle')} class:selected={currentTool === 'rectangle'} title="Rectangle">
          <div style="color: black;">⬛</div><small>Rect</small>
        </div>
        <div class="tool-button" on:click={() => selectTool('polygon')} class:selected={currentTool === 'polygon'} title="Polygon (not implemented)">
          <div style="color: black;">🔷</div><small>Poly</small>
        </div>
        <div class="tool-button" on:click={() => selectTool('ellipse')} class:selected={currentTool === 'ellipse'} title="Ellipse (not implemented)">
          <div style="color: black;">⚪</div><small>Ellipse</small>
        </div>
        <div class="tool-button" on:click={() => selectTool('rounded-rectangle')} class:selected={currentTool === 'rounded-rectangle'} title="Rounded Rectangle (not implemented)">
          <div style="color: black;">⬜</div><small>Round</small>
        </div>
      </div>

      <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
        <div style="flex: 1; overflow: auto; background: #808080; padding: 4px;">
          <canvas
            bind:this={canvas}
            width="1200"
            height="800"
            on:mousedown={startDrawing}
            on:mouseup={stopDrawing}
            on:mouseleave={stopDrawing}
            on:mousemove={draw}
            style="background: white; image-rendering: pixelated; border: 1px solid black;"
          ></canvas>
        </div>

        <div class="color-palette" style="display: flex; flex-wrap: wrap; padding: 4px; background: #C0C0C0; border-top: 1px solid gray;">
          {#each colors as color}
            <div
              on:click={() => selectColor(color)}
              style="width: 20px; height: 20px; background-color: {color}; border: 1px solid black; cursor: pointer; margin: 1px;"
              class:selected-color={color === currentColor}
            ></div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

{#if showAboutDialog}
<div class="about-dialog window" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 300px; z-index: 20;">
  <div class="title-bar">
    <div class="title-bar-text">About Paint</div>
    <div class="title-bar-controls">
      <button aria-label="Close" on:click={() => showAboutDialog = false}></button>
    </div>
  </div>
  <div class="window-body" style="padding: 20px; text-align: center;">
    <p>MS Paint Clone</p>
    <p>created by @nandi.weird.one</p>
    <button style="margin-top: 15px;" on:click={() => showAboutDialog = false}>OK</button>
  </div>
</div>
{/if}

<style>
  .tool-button {
    width: 50px;
    height: 50px;
    margin: 2px 0;
    font-size: 18px;
    padding: 2px;
    background: #FFFFFF;
    border: 1px solid gray;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .tool-button:hover {
    background: #D0D0D0;
  }
  .tool-button.selected {
    outline: 2px solid blue;
  }
  .tool-button small {
    font-size: 10px;
    margin-top: 2px;
  }
  .menubar {
    position: relative; /* Needed for absolute positioning of dropdowns */
  }
  .menubar-item {
    padding: 2px 8px;
    cursor: default;
    user-select: none;
    position: relative; /* Needed for dropdown positioning */
  }
  .menubar-item:hover {
    background: #000080;
    color: white;
  }
  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    background: #C0C0C0;
    border: 1px solid gray;
    box-shadow: 2px 2px 2px rgba(0,0,0,0.5);
    padding: 2px;
    margin: 0;
    list-style: none;
    min-width: 150px; /* Adjust as needed */
    z-index: 11; /* Ensure dropdown is above other content */
  }
  .dropdown li {
    padding: 2px 10px;
    cursor: default;
    white-space: nowrap;
  }
  .dropdown li:hover {
     background: #000080;
     color: white;
  }
   .dropdown li.separator {
    height: 1px;
    background: gray;
    margin: 2px 0;
    padding: 0;
  }
  .selected-color {
    border: 2px solid blue !important; /* Use important to override inline style */
  }
</style>
