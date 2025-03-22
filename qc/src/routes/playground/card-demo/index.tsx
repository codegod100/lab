import { component$, useStylesScoped$ } from '@builder.io/qwik';
import { type DocumentHead } from '@builder.io/qwik-city';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';

export default component$(() => {
  useStylesScoped$(`
    .container {
      display: grid;
      gap: 1.5rem;
    }
    
    @media (min-width: 768px) {
      .container {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    .section-title {
      grid-column: 1 / -1;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
      color: var(--text);
    }
    
    .section-description {
      grid-column: 1 / -1;
      margin-bottom: 1rem;
      color: var(--subtext1);
    }
    
    .card-footer {
      display: flex;
      align-items: center;
      margin-top: 1rem;
      gap: 0.5rem;
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
  `);

  return (
    <div>
      <h1 class="page-title">Card Component Demo</h1>
      <p class="description">Explore the different card variants available in our UI library.</p>
      
      <div class="container">
        <h2 class="section-title">Default Card</h2>
        <p class="section-description">A basic card with a clean border and subtle styling.</p>
        
        <Card title="Default Card" description="This is the standard card component with a header, content, and footer.">
          <p>This card uses the default styling with a clean border and subtle background.</p>
          <div class="card-footer">
            <Button>Primary Action</Button>
            <Button variant="outline">Secondary</Button>
          </div>
        </Card>
        
        <Card>
          <h3>Custom Content</h3>
          <p>Cards can also contain custom content without using the built-in title and description props.</p>
          <p>This allows for more flexible layouts when needed.</p>
          <div class="card-footer">
            <Button variant="secondary">Learn More</Button>
          </div>
        </Card>
        
        <h2 class="section-title">Dots Pattern</h2>
        <p class="section-description">A decorative card with dot patterns around the edges.</p>
        
        <Card 
          variant="dots" 
          title="Dots Pattern Card" 
          description="This card has decorative dots around the corners for a unique style."
        >
          <p>The dots pattern adds visual interest to important content that needs to stand out.</p>
        </Card>
        
        <h2 class="section-title">Neubrutalism</h2>
        <p class="section-description">Bold shadow with a stark design for high contrast.</p>
        
        <Card 
          variant="neubrutalism" 
          title="Neubrutalism Style" 
          description="Bold shadows and borders for a brutalist aesthetic."
        >
          <p>Neubrutalism combines bold shadows and minimal styling for a high-impact design.</p>
          <div class="card-footer">
            <Button>Explore</Button>
          </div>
        </Card>
        
        <h2 class="section-title">Inner Shadow</h2>
        <p class="section-description">A card with inner shadows and gradient styling.</p>
        
        <Card 
          variant="inner" 
          title="Inner Shadow Card" 
          description="This card features subtle inner shadows and gradients."
        >
          <p>The inner shadow variant creates depth through gradient backgrounds and shadow effects.</p>
        </Card>
        
        <h2 class="section-title">Lifted Style</h2>
        <p class="section-description">A card that appears to float above the surface.</p>
        
        <Card 
          variant="lifted" 
          title="Lifted Card" 
          description="This card has a lifted appearance with a shadow underneath."
        >
          <p>The lifted style creates a subtle 3D effect that makes the card appear to float above the surface.</p>
          <div class="card-footer">
            <Button variant="ghost">Read More</Button>
          </div>
        </Card>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Card Component Demo',
  meta: [
    {
      name: 'description',
      content: 'Explore different card component variants for your UI design.',
    },
  ],
};