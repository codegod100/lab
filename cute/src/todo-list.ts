import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit-element';
import './todo-item';

@customElement('to-do-list')
export class ToDoList extends LitElement {
  static styles = css`
    ul {
      padding: 0;
    }
  `;

  @property({ type: Array })
  todos: { text: string; complete: boolean }[] = [];

  @property({ type: String })
  newTodo: string = '';

  render() {
    return html`
      <h1>To do</h1>
      <input
        aria-label="New to do"
        @change=${this._getNewTodo}
        value=${this.newTodo}
      />
      <button @click=${this._addToDo}>Add</button>
      <ul>
        ${this.todos.map((todo, index) => html`
          <li>
            <todo-item
              .todo=${todo}
              .index=${index}
              @removed=${this._removeToDo}
            ></todo-item>
          </li>
        `)}
      </ul>
    `;
  }

  _getNewTodo(e: any) {
    this.newTodo = e.target.value;
  }

  _addToDo() {
    if (this.newTodo) {
      this.todos = [...this.todos, { text: this.newTodo, complete: false }];
      this.newTodo = '';
    }
  }

  _removeToDo(e: any) {
    this.todos = this.todos.filter((todo, index) => index !== e.detail.index);
  }
}
