import { component$, useStylesScoped$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  useStylesScoped$(`
    .about-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .about-title {
      font-size: 2.8rem;
      background: linear-gradient(90deg, var(--mauve), var(--pink));
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1.5rem;
      letter-spacing: -0.03em;
    }

    .about-description {
      font-size: 1.1rem;
      line-height: 1.7;
      margin-bottom: 2.5rem;
      color: var(--subtext0);
    }

    .about-section {
      margin-bottom: 3rem;
    }

    .about-section h2 {
      font-size: 1.8rem;
      color: var(--flamingo);
      margin-bottom: 1.2rem;
      position: relative;
      display: inline-block;
    }

    .about-section h2:after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--pink);
      opacity: 0.5;
    }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 20px;
      margin-top: 1.5rem;
    }

    .team-member {
      background: var(--surface0);
      border: 1px solid var(--surface1);
      border-radius: 12px;
      padding: 1.2rem;
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .team-member:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    .team-member-img {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      margin: 0 auto 10px;
      border: 2px solid var(--sapphire);
    }

    .team-member h3 {
      margin: 10px 0 5px;
      color: var(--text);
      font-size: 1.1rem;
    }

    .team-member p {
      color: var(--overlay1);
      font-size: 0.9rem;
    }

    .values-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .values-list li {
      margin-bottom: 0.8rem;
      color: var(--text);
      padding-left: 1.5rem;
      position: relative;
    }

    .values-list li:before {
      content: '✦';
      position: absolute;
      left: 0;
      color: var(--sapphire);
    }

    .contact-info {
      background: var(--surface0);
      padding: 1.5rem;
      border-radius: 12px;
      margin-top: 1.5rem;
      border: 1px solid var(--surface1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .contact-info p {
      margin: 1rem 0;
      color: var(--text);
    }

    .contact-info strong {
      color: var(--peach);
      margin-right: 0.5rem;
    }
  `);

  return (
    <div class="about-container">
      <h1 class="about-title">About Our Company</h1>
      
      <div class="about-section">
        <p class="about-description">
          Welcome to our company page! We're a forward-thinking team dedicated to building 
          high-performance web applications using cutting-edge technologies like Qwik.
          Our mission is to create blazing-fast experiences that delight users and set 
          new standards for web performance.
        </p>
      </div>

      <div class="about-section">
        <h2>Our Team</h2>
        <div class="team-grid">
          <div class="team-member">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/a/a8/Professional_headshot_of_Lisa_Guerrero_1.jpg" 
              alt="Jane Doe" 
              class="team-member-img" 
            />
            <h3>Jane Doe</h3>
            <p>Founder & CEO</p>
          </div>
          <div class="team-member">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/e/ee/Tim_Sweeney%2C_GDCA_2017_%28portrait_crop%29.jpg" 
              alt="John Smith" 
              class="team-member-img" 
            />
            <h3>John Smith</h3>
            <p>Lead Developer</p>
          </div>
          <div class="team-member">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/3/3d/Industrial_Designer_Jessica_Corr.jpg" 
              alt="Emily Johnson" 
              class="team-member-img" 
            />
            <h3>Emily Johnson</h3>
            <p>UX Designer</p>
          </div>
          <div class="team-member">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/1/13/Akira_Yamaoka_-_Game_Developers_Conference_2010_-_Day_3.jpg" 
              alt="Michael Chen" 
              class="team-member-img" 
            />
            <h3>Michael Chen</h3>
            <p>Frontend Engineer</p>
          </div>
        </div>
      </div>

      <div class="about-section">
        <h2>Our Values</h2>
        <ul class="values-list">
          <li>Performance-first mindset</li>
          <li>User-centered design</li>
          <li>Innovation and experimentation</li>
          <li>Collaboration and knowledge sharing</li>
          <li>Continuous learning</li>
        </ul>
      </div>

      <div class="about-section">
        <h2>Contact Us</h2>
        <div class="contact-info">
          <p><strong>Email:</strong> info@example.com</p>
          <p><strong>Phone:</strong> (123) 456-7890</p>
          <p><strong>Address:</strong> 123 Web Dev Lane, Digital City</p>
        </div>
      </div>
      
      <div class="about-section" style="font-size: 0.8rem; color: var(--overlay0); text-align: center; margin-top: 3rem;">
        <p>All team member images are sourced from Wikimedia Commons and are either in the public domain or under Creative Commons licenses.</p>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "About Us | Qwik App",
  meta: [
    {
      name: "description",
      content: "Learn about our company, team, values, and contact information",
    },
  ],
};