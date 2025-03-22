import { component$, useSignal, useStore, $, useVisibleTask$, useComputed$, useStylesScoped$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

interface Position {
  x: number;
  y: number;
}

export default component$(() => {
  useStylesScoped$(`
    .playground-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .page-title {
      font-size: 2.8rem;
      background: linear-gradient(90deg, var(--mauve), var(--pink));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1.5rem;
      letter-spacing: -0.03em;
    }

    .description {
      color: var(--subtext0);
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    .section {
      margin-bottom: 3rem;
      background: var(--surface0);
      border-radius: 16px;
      border: 1px solid var(--surface1);
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .section h2 {
      color: var(--flamingo);
      margin-bottom: 1rem;
      font-size: 1.5rem;
      border-bottom: 1px solid var(--surface1);
      padding-bottom: 0.75rem;
    }

    /* Counter Section */
    .counter-container {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .button-group {
      display: flex;
      gap: 0.5rem;
    }

    .counter-value {
      font-size: 3rem;
      font-weight: bold;
      color: var(--mauve);
      min-width: 5rem;
      text-align: center;
    }

    .btn {
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      background-color: var(--surface1);
      color: var(--text);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .btn.primary {
      background-color: var(--blue);
      color: white;
    }

    .btn.success {
      background-color: var(--green);
      color: var(--base);
    }

    .btn.danger {
      background-color: var(--red);
      color: white;
    }

    .btn.warning {
      background-color: var(--peach);
      color: var(--base);
    }

    .btn-group {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    /* Todo Section */
    .todo-form {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .todo-input {
      flex: 1;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      background-color: var(--surface1);
      border: 1px solid var(--surface2);
      color: var(--text);
    }

    .todo-input::placeholder {
      color: var(--overlay0);
    }

    .todo-list {
      list-style: none;
      padding: 0;
    }

    .todo-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      background-color: var(--surface1);
      margin-bottom: 0.5rem;
      transition: all 0.2s ease;
    }

    .todo-item:hover {
      transform: translateX(4px);
      background-color: var(--surface2);
    }

    .todo-checkbox {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 4px;
      position: relative;
      appearance: none;
      background-color: var(--surface0);
      border: 1px solid var(--overlay0);
      cursor: pointer;
    }

    .todo-checkbox:checked {
      background-color: var(--green);
      border-color: var(--green);
    }

    .todo-checkbox:checked::before {
      content: '✓';
      position: absolute;
      color: var(--base);
      font-size: 1rem;
      font-weight: bold;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .todo-text {
      flex: 1;
      transition: all 0.2s ease;
    }

    .todo-text.completed {
      text-decoration: line-through;
      color: var(--overlay1);
    }

    .todo-delete {
      background-color: transparent;
      color: var(--red);
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      transition: all 0.2s ease;
    }

    .todo-delete:hover {
      transform: scale(1.2);
    }

    .todo-stats {
      display: flex;
      justify-content: space-between;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--surface1);
      color: var(--subtext0);
    }

    /* Mouse Tracker */
    .mouse-tracker {
      height: 300px;
      background-color: var(--surface1);
      border-radius: 16px;
      position: relative;
      overflow: hidden;
      cursor: crosshair;
    }

    .tracker-info {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background-color: var(--surface0);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      color: var(--text);
      font-family: monospace;
      font-size: 0.9rem;
      pointer-events: none;
    }

    .tracker-dot {
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: var(--mauve);
      transform: translate(-50%, -50%);
      pointer-events: none;
      box-shadow: 0 0 10px var(--mauve);
    }

    .trail {
      position: absolute;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--pink);
      transform: translate(-50%, -50%);
      pointer-events: none;
      opacity: 0.8;
      transition: opacity 0.5s ease;
    }

    /* Animation and Color Section */
    .color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .color-tile {
      aspect-ratio: 1;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .color-tile:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .color-preview {
      width: 100%;
      height: 100px;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: var(--base);
      font-weight: bold;
      transition: all 0.3s ease;
    }

    .animation-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    /* Form Section */
    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text);
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      background-color: var(--surface1);
      border: 1px solid var(--surface2);
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .form-preview {
      margin-top: 1.5rem;
      padding: 1rem;
      background-color: var(--surface1);
      border-radius: 8px;
      color: var(--text);
    }

    .form-error {
      color: var(--red);
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }
  `);

  // Counter Section
  const count = useSignal(0);
  const doubleCount = useComputed$(() => count.value * 2);
  const countHistory = useSignal<number[]>([]);

  const updateCounter = $((value: number) => {
    count.value += value;
    countHistory.value = [...countHistory.value, count.value].slice(-5);
  });

  // Todo List Section
  const todoInput = useSignal('');
  const todos = useStore<{ items: TodoItem[], nextId: number }>({ 
    items: [
      { id: 1, text: 'Learn Qwik', completed: true },
      { id: 2, text: 'Build reactive application', completed: false },
      { id: 3, text: 'Master Catppuccin theme', completed: false }
    ], 
    nextId: 4 
  });

  const completedCount = useComputed$(() => {
    return todos.items.filter(item => item.completed).length;
  });

  const remainingCount = useComputed$(() => {
    return todos.items.length - completedCount.value;
  });

  const addTodo = $(() => {
    if (todoInput.value.trim() !== '') {
      todos.items.push({
        id: todos.nextId,
        text: todoInput.value.trim(),
        completed: false
      });
      todos.nextId++;
      todoInput.value = '';
    }
  });

  const toggleTodo = $((id: number) => {
    const todo = todos.items.find(item => item.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  });

  const deleteTodo = $((id: number) => {
    todos.items = todos.items.filter(item => item.id !== id);
  });

  // Mouse Tracker
  const mousePosition = useSignal<Position>({ x: 0, y: 0 });
  const mouseTrail = useSignal<Position[]>([]);
  const isTracking = useSignal(false);

  // Mouse position tracking is now handled inline

  // Color and Animation
  const colors = [
    '#f5c2e7', '#cba6f7', '#f38ba8', '#fab387', 
    '#a6e3a1', '#74c7ec', '#89b4fa', '#b4befe'
  ];
  const selectedColor = useSignal(colors[0]);
  const rotationDegree = useSignal(0);
  const scaleValue = useSignal(1);
  const isAnimating = useSignal(false);

  // Animation loop
  useVisibleTask$(({ track, cleanup }) => {
    track(() => isAnimating.value);
    
    if (!isAnimating.value) return;
    
    let animationFrame: number;
    
    const animate = () => {
      rotationDegree.value = (rotationDegree.value + 1) % 360;
      scaleValue.value = 1 + 0.2 * Math.sin(Date.now() / 500);
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    cleanup(() => {
      cancelAnimationFrame(animationFrame);
    });
  });

  // Reactive Form
  const formData = useStore({
    name: '',
    email: '',
    message: ''
  });

  const formErrors = useStore({
    name: '',
    email: ''
  });

  const validateForm = $(() => {
    let isValid = true;
    
    // Reset errors
    formErrors.name = '';
    formErrors.email = '';
    
    // Name validation
    if (!formData.name.trim()) {
      formErrors.name = 'Name is required';
      isValid = false;
    }
    
    // Email validation
    if (!formData.email.trim()) {
      formErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      formErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    return isValid;
  });

  const submitForm = $(async () => {
    const isValid = await validateForm();
    
    if (isValid) {
      alert(`Form submitted successfully!\nName: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`);
      
      // Reset form
      formData.name = '';
      formData.email = '';
      formData.message = '';
    }
  });

  return (
    <div class="playground-container">
      <h1 class="page-title">Reactive Playground</h1>
      <p class="description">
        Explore various reactive features of Qwik framework in this interactive playground.
        Each section demonstrates different aspects of reactivity and state management.
      </p>

      {/* Counter Section */}
      <section class="section">
        <h2>Interactive Counter</h2>
        <div class="counter-container">
          <div class="counter-value">{count.value}</div>
          <div class="button-group">
            <button class="btn danger" onClick$={() => updateCounter(-10)}>-10</button>
            <button class="btn danger" onClick$={() => updateCounter(-1)}>-1</button>
            <button class="btn primary" onClick$={() => updateCounter(1)}>+1</button>
            <button class="btn primary" onClick$={() => updateCounter(10)}>+10</button>
          </div>
        </div>

        <div>
          <p>Double value: <strong>{doubleCount.value}</strong></p>
          <p>History (last 5 values): {countHistory.value.join(', ') || 'No history yet'}</p>
        </div>
        
        <div class="btn-group">
          <button class="btn warning" onClick$={() => {
            count.value = 0;
            countHistory.value = [];
          }}>Reset</button>
          <button class="btn success" onClick$={() => {
            updateCounter(Math.floor(Math.random() * 100) - 50);
          }}>Random Update</button>
        </div>
      </section>

      {/* Todo List Section */}
      <section class="section">
        <h2>Todo List</h2>
        <form class="todo-form" preventdefault:submit onSubmit$={addTodo}>
          <input 
            type="text" 
            class="todo-input" 
            placeholder="Add a new task..." 
            onInput$={(e) => {
              const target = e.target as HTMLInputElement;
              todoInput.value = target.value;
            }}
            value={todoInput.value}
          />
          <button type="submit" class="btn primary">Add</button>
        </form>

        <ul class="todo-list">
          {todos.items.map(todo => (
            <li key={todo.id} class="todo-item">
              <input 
                type="checkbox" 
                class="todo-checkbox" 
                checked={todo.completed} 
                onChange$={() => toggleTodo(todo.id)}
              />
              <span class={`todo-text ${todo.completed ? 'completed' : ''}`}>
                {todo.text}
              </span>
              <button 
                class="todo-delete" 
                onClick$={() => deleteTodo(todo.id)}
                aria-label="Delete task"
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <div class="todo-stats">
          <span>{completedCount.value} completed</span>
          <span>{remainingCount.value} remaining</span>
          <span>{todos.items.length} total</span>
        </div>
      </section>

      {/* Mouse Tracker */}
      <section class="section">
        <h2>Mouse Tracker</h2>
        <div 
          class="mouse-tracker"
          id="mouse-tracker"
          onMouseMove$={(e) => {
            if (isTracking.value) {
              const tracker = document.getElementById('mouse-tracker');
              if (tracker) {
                const rect = tracker.getBoundingClientRect();
                const x = Math.round(e.clientX - rect.left);
                const y = Math.round(e.clientY - rect.top);
                
                // Update position
                mousePosition.value = { x, y };
                
                // Add position to trail
                const newTrail = [{ x, y }, ...mouseTrail.value];
                if (newTrail.length > 10) {
                  newTrail.length = 10;
                }
                mouseTrail.value = newTrail;
              }
            }
          }}
          onMouseEnter$={() => isTracking.value = true}
          onMouseLeave$={() => isTracking.value = false}
        >
          {isTracking.value && (
            <>
              <div class="tracker-info">
                X: {mousePosition.value.x}, Y: {mousePosition.value.y}
              </div>
              <div 
                class="tracker-dot"
                style={{ left: `${mousePosition.value.x}px`, top: `${mousePosition.value.y}px` }}
              ></div>
              {mouseTrail.value.map((pos, index) => (
                <div 
                  key={index}
                  class="trail"
                  style={{ 
                    left: `${pos.x}px`, 
                    top: `${pos.y}px`,
                    opacity: `${1 - index * 0.1}`,
                    transform: `scale(${1 - index * 0.08})`
                  }}
                ></div>
              ))}
            </>
          )}
          {!isTracking.value && (
            <div style={{ 
              display: 'flex', 
              height: '100%', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--subtext0)'
            }}>
              Hover here to track mouse movement
            </div>
          )}
        </div>
      </section>

      {/* Color and Animation */}
      <section class="section">
        <h2>Color Picker & Animation</h2>
        <div 
          class="color-preview"
          style={{ 
            backgroundColor: selectedColor.value,
            transform: `rotate(${rotationDegree.value}deg) scale(${scaleValue.value})`
          }}
        >
          {selectedColor.value}
        </div>
        
        <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem', color: 'var(--text)' }}>
          Select a Color:
        </h3>
        <div class="color-grid">
          {colors.map(color => (
            <div 
              key={color}
              class="color-tile"
              style={{ backgroundColor: color }}
              onClick$={() => selectedColor.value = color}
            ></div>
          ))}
        </div>
        
        <div class="animation-controls">
          <button 
            class={`btn ${isAnimating.value ? 'danger' : 'success'}`}
            onClick$={() => isAnimating.value = !isAnimating.value}
          >
            {isAnimating.value ? 'Stop Animation' : 'Start Animation'}
          </button>
          <button 
            class="btn"
            onClick$={() => {
              rotationDegree.value = 0;
              scaleValue.value = 1;
            }}
            disabled={isAnimating.value}
          >
            Reset
          </button>
        </div>
      </section>

      {/* Reactive Form */}
      <section class="section">
        <h2>Reactive Form</h2>
        <form preventdefault:submit onSubmit$={submitForm}>
          <div class="form-group">
            <label class="form-label" for="name">Name</label>
            <input 
              id="name"
              type="text" 
              class="form-input" 
              onInput$={(e) => {
                const target = e.target as HTMLInputElement;
                formData.name = target.value;
              }}
              value={formData.name}
            />
            {formErrors.name && <div class="form-error">{formErrors.name}</div>}
          </div>
          
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input 
              id="email"
              type="email" 
              class="form-input" 
              onInput$={(e) => {
                const target = e.target as HTMLInputElement;
                formData.email = target.value;
              }}
              value={formData.email}
            />
            {formErrors.email && <div class="form-error">{formErrors.email}</div>}
          </div>
          
          <div class="form-group">
            <label class="form-label" for="message">Message</label>
            <textarea 
              id="message"
              class="form-input" 
              rows={4}
              onInput$={(e) => {
                const target = e.target as HTMLTextAreaElement;
                formData.message = target.value;
              }}
              value={formData.message}
            ></textarea>
          </div>
          
          <button type="submit" class="btn primary">Submit</button>
        </form>
        
        {(formData.name || formData.email || formData.message) && (
          <div class="form-preview">
            <h3 style={{ marginTop: 0, color: 'var(--mauve)' }}>Form Preview</h3>
            <p><strong>Name:</strong> {formData.name || '(not provided)'}</p>
            <p><strong>Email:</strong> {formData.email || '(not provided)'}</p>
            <p><strong>Message:</strong> {formData.message || '(not provided)'}</p>
          </div>
        )}
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Playground | Qwik App",
  meta: [
    {
      name: "description",
      content: "Interactive playground demonstrating Qwik's reactivity features",
    },
  ],
};