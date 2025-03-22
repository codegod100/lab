import { component$, Slot, useStylesScoped$ } from '@builder.io/qwik';

export interface CardProps {
  variant?: 'default' | 'dots' | 'neubrutalism' | 'inner' | 'lifted';
  class?: string;
  title?: string;
  description?: string;
}

export const Card = component$<CardProps>(({ 
  variant = 'default', 
  class: className = '', 
  title,
  description 
}) => {
  useStylesScoped$(`
    .card {
      width: 100%;
      position: relative;
    }
    
    .card-default {
      border-radius: 0.5rem;
      border: 1px solid var(--surface0);
      background-color: var(--mantle);
    }
    
    .card-content {
      padding: 1.5rem;
    }
    
    .card-title {
      font-size: 1.125rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      color: var(--text);
    }
    
    .card-description {
      font-size: 0.875rem;
      color: var(--subtext1);
      margin-bottom: 1rem;
    }
    
    /* Dots variant */
    .card-dots {
      position: relative;
      width: 100%;
      margin: 0 auto;
      border-radius: 0.5rem;
      border: 1px dashed var(--surface1);
      padding: 1rem;
    }
    
    .card-dots:before, .card-dots:after {
      content: '';
      position: absolute;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: var(--surface1);
      z-index: -1;
    }
    
    .card-dots:before {
      top: 1rem;
    }
    
    .card-dots:after {
      bottom: 1rem;
    }
    
    /* Neubrutalism variant */
    .card-neubrutalism {
      border: 0.5px solid var(--surface2);
      position: relative;
      box-shadow: 4px 4px 0px 0px var(--crust);
    }
    
    .dark-theme .card-neubrutalism {
      box-shadow: 3px 3px 0px 0px rgba(255,255,255,0.3);
    }
    
    /* Inner variant */
    .card-inner {
      border: 0.5px solid var(--surface1);
      border-radius: 0.125rem;
      padding: 0.5rem;
    }
    
    .card-inner .card-content {
      border-radius: 0.125rem;
      background: linear-gradient(to bottom right, var(--base), var(--surface0));
      border: 1px solid var(--surface0);
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    }
    
    .dark-theme .card-inner .card-content {
      background: linear-gradient(to bottom right, var(--base), var(--surface1));
      border-color: var(--surface0);
      box-shadow: inset 2px 2px 8px rgba(0, 0, 0, 0.3);
    }
    
    /* Lifted variant */
    .card-lifted {
      border-radius: 0.75rem;
      border: 1px solid var(--surface1);
      position: relative;
      box-shadow: 0px 5px 0px 0px rgba(0, 0, 0, 0.7);
      background-color: var(--surface0);
    }
    
    .dark-theme .card-lifted {
      box-shadow: 0px 4px 0px 0px rgba(255, 255, 255, 0.3);
      background-color: var(--surface0);
    }

    /* For dots variant with corner dots */
    .dots-container {
      position: relative;
      width: 100%;
      border-left: 1px solid var(--surface1);
      border-right: 1px solid var(--surface1);
    }
    
    .corner-dots {
      position: absolute;
      z-index: 0;
      height: 100%;
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
    }
    
    .dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: var(--green);
      outline: 8px solid var(--base);
      margin: 1rem 0;
    }
    
    .dot:nth-child(odd) {
      transform: translateX(-2px);
    }
    
    .dot:nth-child(even) {
      transform: translateX(2px);
      justify-self: end;
    }
  `);

  // Define content with or without title/description
  const renderContent = () => (
    <>
      {title && <h3 class="card-title">{title}</h3>}
      {description && <p class="card-description">{description}</p>}
      <Slot />
    </>
  );

  if (variant === 'dots') {
    return (
      <div class={`card card-dots ${className}`}>
        <div class="dots-container">
          <div class="corner-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <div class="card-content">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }
  
  if (variant === 'inner') {
    return (
      <div class={`card card-inner ${className}`}>
        <div class="card-content">
          {renderContent()}
        </div>
      </div>
    );
  }

  // Default, neubrutalism, and lifted variants
  return (
    <div class={`card card-${variant} ${className}`}>
      <div class="card-content">
        {renderContent()}
      </div>
    </div>
  );
});

export default Card;