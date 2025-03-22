import { component$, useStylesScoped$, Slot, type QwikIntrinsicElements } from '@builder.io/qwik';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  class?: string;
  type?: QwikIntrinsicElements['button']['type'];
  disabled?: boolean;
}

export const Button = component$<ButtonProps>(({ 
  variant = 'primary', 
  size = 'md',
  class: className = '',
  type = 'button',
  disabled = false,
}) => {
  useStylesScoped$(`
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.375rem;
      font-weight: 500;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    .button:focus-visible {
      outline: 2px solid var(--blue);
      outline-offset: 2px;
    }

    .button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    
    /* Size variants */
    .button-sm {
      height: 2rem;
      padding: 0 0.75rem;
      font-size: 0.75rem;
    }
    
    .button-md {
      height: 2.5rem;
      padding: 0 1rem;
      font-size: 0.875rem;
    }
    
    .button-lg {
      height: 3rem;
      padding: 0 1.5rem;
      font-size: 1rem;
    }
    
    /* Style variants */
    .button-primary {
      background-color: var(--mauve);
      color: var(--crust);
      border: none;
    }
    
    .button-primary:hover:not(:disabled) {
      background-color: var(--lavender);
    }
    
    .button-primary:active:not(:disabled) {
      background-color: var(--blue);
    }
    
    .button-secondary {
      background-color: var(--surface1);
      color: var(--text);
      border: none;
    }
    
    .button-secondary:hover:not(:disabled) {
      background-color: var(--surface2);
    }
    
    .button-secondary:active:not(:disabled) {
      background-color: var(--overlay0);
    }
    
    .button-outline {
      background-color: transparent;
      color: var(--text);
      border: 1px solid var(--surface1);
    }
    
    .button-outline:hover:not(:disabled) {
      background-color: var(--surface0);
      border-color: var(--surface2);
    }
    
    .button-outline:active:not(:disabled) {
      background-color: var(--surface1);
    }
    
    .button-ghost {
      background-color: transparent;
      color: var(--text);
      border: none;
    }
    
    .button-ghost:hover:not(:disabled) {
      background-color: var(--surface0);
    }
    
    .button-ghost:active:not(:disabled) {
      background-color: var(--surface1);
    }
  `);

  return (
    <button
      type={type}
      class={`button button-${variant} button-${size} ${className}`}
      disabled={disabled}
    >
      <Slot />
    </button>
  );
});

export default Button;