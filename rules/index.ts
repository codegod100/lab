export type Rule = number; // Rules will be represented by their Wolfram code (0-255)

export class RuliadSimulator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cellSize: number = 2; // Smaller cells for more compact visualization
  private generations: Map<Rule, boolean[]> = new Map();
  private currentGeneration: number = 0;
  private rules: Rule[] = [];

  constructor(canvasId: string, width: number) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    
    // Generate rules to visualize (can be adjusted)
    this.rules = [30, 90, 110, 184, 54, 60, 150];
    
    // Initialize first generation for each rule
    for (const rule of this.rules) {
      const initialGen = new Array(width).fill(false);
      initialGen[Math.floor(width / 2)] = true;
      this.generations.set(rule, initialGen);
    }

    // Set canvas size to accommodate all rules
    this.canvas.height = this.rules.length * width * this.cellSize;
    this.canvas.width = width * this.cellSize;
  }

  private applyRule(rule: Rule, left: boolean, center: boolean, right: boolean): boolean {
    // Convert neighborhood to binary index (0-7)
    const index = (left ? 4 : 0) + (center ? 2 : 0) + (right ? 1 : 0);
    // Check if the corresponding bit in the rule number is set
    return ((rule >> index) & 1) === 1;
  }

  private nextGeneration(rule: Rule, currentGen: boolean[]): boolean[] {
    const nextGen = new Array(currentGen.length).fill(false);

    for (let i = 0; i < currentGen.length; i++) {
      const left = i > 0 ? currentGen[i - 1] : false;
      const center = currentGen[i];
      const right = i < currentGen.length - 1 ? currentGen[i + 1] : false;

      nextGen[i] = this.applyRule(rule, left, center, right);
    }

    return nextGen;
  }

  private drawCell(x: number, y: number, alive: boolean, ruleIndex: number) {
    this.ctx.fillStyle = alive ? "black" : "white";
    this.ctx.fillRect(
      x * this.cellSize,
      (y + ruleIndex * this.generations.get(this.rules[0])!.length) * this.cellSize,
      this.cellSize,
      this.cellSize
    );
  }

  public step() {
    // Draw and update each rule
    this.rules.forEach((rule, ruleIndex) => {
      const currentGen = this.generations.get(rule)!;
      
      // Draw current generation
      for (let i = 0; i < currentGen.length; i++) {
        this.drawCell(i, this.currentGeneration, currentGen[i], ruleIndex);
      }

      // Calculate next generation
      this.generations.set(rule, this.nextGeneration(rule, currentGen));
    });

    this.currentGeneration++;
  }

  public animate(steps: number) {
    let currentStep = 0;
    const animate = () => {
      if (currentStep < steps) {
        this.step();
        currentStep++;
        requestAnimationFrame(animate);
      }
    };
    animate();
  }
}
