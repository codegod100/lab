import { LitElement, html, css, customElement } from 'lit-element';
import { property } from 'lit/decorators';

@customElement('to-do-item')
export class ToDoItem extends LitElement {
  static styles = css`
    .completed {
      text-decoration: line-through;
    }
  `;

  @property({ type: Object })
  todo: { text: string; complete: boolean } = { text: '', complete: false };

  @property({ type: Number })
  index: number = 0;

  render() {
    return html`
      <span class="${this.todo.complete ? 'completed' : ''}">${this.todo.text}</span>
      <input
        type="checkbox"
        .checked=${this.todo.complete}
        @change=${this._toggleComplete}
      />
      <button @click=${this._removeToDo}>Remove</button>
    `;
  }

  _toggleComplete() {
    this.todo = { ...this.todo, complete: !this.todo.complete };
    this.requestUpdate();
  }

  _removeToDo() {
    this.dispatchEvent(
      new CustomEvent('removed', { detail: { index: this.index } })
    );
  }
}