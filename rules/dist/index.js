// index.ts
class RuliadSimulator {
  canvas;
  ctx;
  cellSize = 2;
  generations = new Map;
  currentGeneration = 0;
  rules = [];
  constructor(canvasId, width) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.rules = [30, 90, 110, 184, 54, 60, 150];
    for (const rule of this.rules) {
      const initialGen = new Array(width).fill(false);
      initialGen[Math.floor(width / 2)] = true;
      this.generations.set(rule, initialGen);
    }
    this.canvas.height = this.rules.length * width * this.cellSize;
    this.canvas.width = width * this.cellSize;
  }
  applyRule(rule, left, center, right) {
    const index = (left ? 4 : 0) + (center ? 2 : 0) + (right ? 1 : 0);
    return (rule >> index & 1) === 1;
  }
  nextGeneration(rule, currentGen) {
    const nextGen = new Array(currentGen.length).fill(false);
    for (let i = 0;i < currentGen.length; i++) {
      const left = i > 0 ? currentGen[i - 1] : false;
      const center = currentGen[i];
      const right = i < currentGen.length - 1 ? currentGen[i + 1] : false;
      nextGen[i] = this.applyRule(rule, left, center, right);
    }
    return nextGen;
  }
  drawCell(x, y, alive, ruleIndex) {
    this.ctx.fillStyle = alive ? "black" : "white";
    this.ctx.fillRect(x * this.cellSize, (y + ruleIndex * this.generations.get(this.rules[0]).length) * this.cellSize, this.cellSize, this.cellSize);
  }
  step() {
    this.rules.forEach((rule, ruleIndex) => {
      const currentGen = this.generations.get(rule);
      for (let i = 0;i < currentGen.length; i++) {
        this.drawCell(i, this.currentGeneration, currentGen[i], ruleIndex);
      }
      this.generations.set(rule, this.nextGeneration(rule, currentGen));
    });
    this.currentGeneration++;
  }
  animate(steps) {
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
export {
  RuliadSimulator
};
