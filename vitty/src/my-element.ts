import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

/**
 * Skeuomorphic todo app component
 *
 * @slot - This element has a slot
 * @csspart input - The todo input
 * @csspart button - The add button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  /**
   * The title of the todo app.
   */
  @property()
  title = 'My Todo List';

  /**
   * The list of todo items.
   */
  @state()
  private _todos: TodoItem[] = [];

  /**
   * The next id for a new todo item.
   */
  @state()
  private _nextId = 1;

  /**
   * The current input value.
   */
  @state()
  private _inputValue = '';

  render() {
    const activeTodos = this._todos.filter(todo => !todo.completed);
    const completedTodos = this._todos.filter(todo => todo.completed);

    return html`
      <div class="notebook">
        <div class="notebook-header">
          <h1>${this.title}</h1>
        </div>
        
        <div class="input-container">
          <div class="paper-input">
            <input 
              type="text" 
              placeholder="Write a new task..."
              .value=${this._inputValue} 
              @input=${this._handleInput}
              @keydown=${this._handleKeyDown}
              part="input"
            />
          </div>
          <button @click=${this._addTodo} part="button">
            <span>Add Task</span>
          </button>
        </div>
        
        <div class="section">
          <div class="section-header">
            <h2>To-Do Tasks (${activeTodos.length})</h2>
            <div class="paper-clip"></div>
          </div>
          <ul class="task-list">
            ${activeTodos.map(todo => html`
              <li class="task-item">
                <label class="checkbox">
                  <input 
                    type="checkbox" 
                    .checked=${false} 
                    @change=${() => this._toggleTodo(todo.id)}
                  />
                  <span class="checkmark"></span>
                </label>
                <span class="task-text">${todo.text}</span>
                <button @click=${() => this._deleteTodo(todo.id)} class="delete-btn">×</button>
              </li>
            `)}
            ${activeTodos.length === 0 ? html`<li class="empty-message">Nothing to do here!</li>` : ''}
          </ul>
        </div>
        
        <div class="section">
          <div class="section-header">
            <h2>Completed Tasks (${completedTodos.length})</h2>
            <div class="paper-clip rotate"></div>
          </div>
          <ul class="task-list completed-list">
            ${completedTodos.map(todo => html`
              <li class="task-item completed">
                <label class="checkbox">
                  <input 
                    type="checkbox" 
                    .checked=${true} 
                    @change=${() => this._toggleTodo(todo.id)}
                  />
                  <span class="checkmark"></span>
                </label>
                <span class="task-text">${todo.text}</span>
                <button @click=${() => this._deleteTodo(todo.id)} class="delete-btn">×</button>
              </li>
            `)}
            ${completedTodos.length === 0 ? html`<li class="empty-message">Nothing completed yet.</li>` : ''}
          </ul>
        </div>
        
        <div class="footer">
          <span>${this._getActiveTodoCount()} tasks left</span>
          <button @click=${this._clearCompleted} ?disabled=${!this._hasTodoCompleted()} class="clear-btn">
            Clear completed
          </button>
        </div>

        <div class="spiral">
          ${Array(24).fill(0).map(() => html`<div class="spiral-circle"></div>`)}
        </div>
      </div>
      <slot></slot>
    `
  }

  private _handleInput(e: Event) {
    this._inputValue = (e.target as HTMLInputElement).value;
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this._addTodo();
    }
  }

  private _addTodo() {
    if (!this._inputValue.trim()) return;
    
    this._todos = [
      ...this._todos, 
      {
        id: this._nextId,
        text: this._inputValue.trim(),
        completed: false
      }
    ];
    
    this._nextId++;
    this._inputValue = '';
  }

  private _toggleTodo(id: number) {
    this._todos = this._todos.map(todo => 
      todo.id === id ? {...todo, completed: !todo.completed} : todo
    );
  }

  private _deleteTodo(id: number) {
    this._todos = this._todos.filter(todo => todo.id !== id);
  }

  private _clearCompleted() {
    this._todos = this._todos.filter(todo => !todo.completed);
  }

  private _getActiveTodoCount() {
    return this._todos.filter(todo => !todo.completed).length;
  }

  private _hasTodoCompleted() {
    return this._todos.some(todo => todo.completed);
  }

  static styles = css`
    :host {
      display: block;
      font-family: "Marker Felt", "Comic Sans MS", cursive;
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
      background: #e0e0e0;
      color: #333;
      min-height: 100vh;
    }

    .notebook {
      position: relative;
      background: #f8f6f1;
      padding: 3rem 2rem 2rem;
      border-radius: 5px;
      box-shadow: 
        0 2px 5px rgba(0,0,0,0.1),
        0 0 20px rgba(0,0,0,0.06),
        0 5px 5px -3px rgba(0,0,0,0.1),
        0 0 0 1px rgba(0,0,0,0.05),
        0 20px 25px -5px rgba(0,0,0,0.1);
      background-image: 
        repeating-linear-gradient(#f8f6f1, #f8f6f1 31px, #91D1D3 31px, #91D1D3 32px);
      min-height: 500px;
      transform: rotate(-1deg);
    }

    /* Notebook spiral binding */
    .spiral {
      position: absolute;
      top: 0px;
      left: 40px;
      right: 40px;
      height: 20px;
      display: flex;
      justify-content: space-between;
      z-index: 2;
    }

    .spiral-circle {
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background: #f8f6f1;
      box-shadow: 
        inset 0 0 0 2px #aaa,
        inset 0 0 0 8px #f8f6f1,
        0 0 0 2px rgba(0,0,0,0.1),
        0 0 5px rgba(0,0,0,0.2);
      transform: translateY(-2px);
    }

    .notebook-header {
      position: relative;
      margin: -32px -2rem 2rem;
      padding: 1rem 2rem 0;
      z-index: 1;
    }

    h1 {
      text-align: center;
      font-size: 2rem;
      color: #4a5568;
      margin: 0;
      padding-bottom: 1rem;
      text-shadow: 1px 1px 0 rgba(255,255,255,0.6);
      position: relative;
    }

    .input-container {
      display: flex;
      gap: 10px;
      margin-bottom: 2rem;
      align-items: stretch;
    }

    .paper-input {
      flex: 1;
      position: relative;
      background: #fff;
      border-radius: 5px;
      box-shadow: 
        inset 0 1px 3px rgba(0,0,0,0.2),
        0 1px 0 rgba(255,255,255,0.7);
    }

    input[type="text"] {
      font-family: inherit;
      width: 100%;
      padding: 0.8rem 1rem;
      border: none;
      background: transparent;
      font-size: 1rem;
      color: #4a5568;
    }

    input[type="text"]:focus {
      outline: none;
    }

    button {
      background: #4299e1;
      border: none;
      border-radius: 5px;
      color: white;
      padding: 0.5rem 1rem;
      font-family: inherit;
      font-size: 1rem;
      cursor: pointer;
      box-shadow: 
        0 2px 4px rgba(0,0,0,0.15),
        0 1px 2px rgba(0,0,0,0.1),
        inset 0 1px 0 rgba(255,255,255,0.3);
      position: relative;
      overflow: hidden;
    }

    button::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(to bottom, rgba(255,255,255,0.3), transparent);
      pointer-events: none;
    }

    button:hover {
      background: #3182ce;
    }

    button:active {
      box-shadow: 
        0 1px 2px rgba(0,0,0,0.15),
        inset 0 1px 3px rgba(0,0,0,0.2);
      transform: translateY(1px);
    }

    .section {
      position: relative;
      margin-bottom: 2rem;
    }

    .section-header {
      position: relative;
      margin-bottom: 0.75rem;
    }

    .paper-clip {
      position: absolute;
      top: 0;
      right: 1rem;
      width: 12px;
      height: 24px;
      border: 2px solid #aaa;
      border-radius: 0 0 5px 5px;
      border-top: none;
      transform: rotate(45deg);
      z-index: 2;
      box-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    .paper-clip.rotate {
      transform: rotate(-45deg);
      right: auto;
      left: 1rem;
    }

    .paper-clip::before {
      content: '';
      position: absolute;
      top: -8px;
      left: -2px;
      width: 12px;
      height: 10px;
      border: 2px solid #aaa;
      border-radius: 5px 5px 0 0;
    }

    h2 {
      font-size: 1.2rem;
      color: #4a5568;
      margin: 0 0 0.5rem 0;
      padding-left: 0.5rem;
      border-bottom: 2px solid #4299e1;
    }

    .task-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .task-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 0.5rem;
      position: relative;
      border-bottom: 1px dashed #cbd5e0;
    }

    .checkbox {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      cursor: pointer;
    }

    .checkbox input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
    }

    .checkmark {
      position: relative;
      height: 20px;
      width: 20px;
      background: #f8f6f1;
      border: 2px solid #4a5568;
      border-radius: 3px;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
    }

    .checkbox input:checked ~ .checkmark:after {
      content: '';
      position: absolute;
      left: 6px;
      top: 2px;
      width: 5px;
      height: 10px;
      border: solid #4299e1;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    .task-text {
      flex: 1;
      font-size: 1.1rem;
      color: #4a5568;
      transition: color 0.2s;
      line-height: 1.5;
    }

    .task-item.completed .task-text {
      text-decoration: line-through;
      color: #a0aec0;
    }

    .delete-btn {
      background: transparent;
      color: #e53e3e;
      border: none;
      font-size: 1.5rem;
      line-height: 1;
      padding: 0 0.5rem;
      cursor: pointer;
      box-shadow: none;
      opacity: 0.5;
    }

    .delete-btn:hover {
      background: transparent;
      opacity: 1;
    }

    .delete-btn:active {
      box-shadow: none;
      transform: none;
    }

    .delete-btn::after {
      display: none;
    }

    .empty-message {
      padding: 1rem 0.5rem;
      color: #a0aec0;
      font-style: italic;
      text-align: center;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0 0;
      color: #718096;
      border-top: 1px dashed #cbd5e0;
    }

    .clear-btn {
      background: transparent;
      color: #4299e1;
      border: 1px solid #4299e1;
      font-size: 0.9rem;
      padding: 0.3rem 0.8rem;
      border-radius: 3px;
      box-shadow: none;
    }

    .clear-btn:hover {
      background: rgba(66, 153, 225, 0.1);
    }

    .clear-btn:active {
      box-shadow: none;
    }

    .clear-btn::after {
      display: none;
    }

    .clear-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        background: #2d3748;
      }

      .notebook {
        background: #1a202c;
        background-image: 
          repeating-linear-gradient(#1a202c, #1a202c 31px, #2c5282 31px, #2c5282 32px);
        box-shadow: 
          0 4px 6px rgba(0,0,0,0.3),
          0 0 20px rgba(0,0,0,0.2),
          0 5px 5px -3px rgba(0,0,0,0.3),
          0 0 0 1px rgba(0,0,0,0.1);
      }

      .spiral-circle {
        background: #2d3748;
        box-shadow: 
          inset 0 0 0 2px #64748b,
          inset 0 0 0 8px #1a202c,
          0 0 0 2px rgba(0,0,0,0.3);
      }

      h1, h2 {
        color: #e2e8f0;
        text-shadow: 1px 1px 0 rgba(0,0,0,0.4);
      }

      .paper-input {
        background: #2d3748;
        box-shadow: 
          inset 0 1px 3px rgba(0,0,0,0.4),
          0 1px 0 rgba(255,255,255,0.1);
      }

      input[type="text"] {
        color: #e2e8f0;
      }

      .checkmark {
        background: #2d3748;
        border-color: #a0aec0;
      }

      .task-text {
        color: #e2e8f0;
      }

      .task-item.completed .task-text {
        color: #718096;
      }

      .task-item {
        border-color: #4a5568;
      }

      .empty-message {
        color: #718096;
      }

      .footer {
        color: #a0aec0;
        border-color: #4a5568;
      }
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}