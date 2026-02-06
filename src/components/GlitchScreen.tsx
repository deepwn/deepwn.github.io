'use client';
import { useRef, useEffect, useCallback } from 'react';

const FONT_SIZE = 16;
const CHAR_WIDTH = 10;
const CHAR_HEIGHT = 20;
const CHARACTER_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*()-_{}[]:;<>,.?/';
class Particle {
  char: string;
  initialColor: string;
  currentColor: string;
  targetColor: string;
  colorProgress: number;

  constructor(char: string, color: string, targetColor: string) {
    this.char = char;
    this.initialColor = color;
    this.currentColor = color;
    this.targetColor = targetColor;
    this.colorProgress = 1.0; // Start fully at the initial color
  }

  // Draws the particle on the canvas
  draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = this.currentColor;
    ctx.fillText(this.char, x, y);
  }

  // Assigns a new random character
  randomizeCharacter() {
    this.char = CHARACTER_SET[Math.floor(Math.random() * CHARACTER_SET.length)];
  }

  // Sets a new target color to transition towards
  setNewTargetColor(newColor: string, smooth: boolean) {
    if (!smooth) {
      this.currentColor = newColor;
      this.targetColor = newColor;
      this.colorProgress = 1.0;
    } else {
      this.initialColor = this.currentColor;
      this.targetColor = newColor;
      this.colorProgress = 0.0;
    }
  }

  // Updates the color transition if needed
  updateColorTransition(): boolean {
    if (this.colorProgress >= 1) return false;

    this.colorProgress = Math.min(this.colorProgress + 0.05, 1);

    const start = ColorUtils.hexToRgb(this.initialColor);
    const end = ColorUtils.hexToRgb(this.targetColor);

    if (start && end) {
      this.currentColor = ColorUtils.interpolateRgb(start, end, this.colorProgress);
    }
    return true; // Indicates a change was made
  }
}

// ================================================================================
// Utility Functions
// A collection of pure helper functions.
// ================================================================================
interface RgbColor {
  r: number;
  g: number;
  b: number;
}

const ColorUtils = {
  // A different implementation of hex-to-rgb conversion
  hexToRgb(hex: string): RgbColor | null {
    if (!hex || hex.charAt(0) !== '#') return null;
    const cleanHex = hex.substring(1);

    // Handle 3-digit hex
    const fullHex =
      cleanHex.length === 3
        ? cleanHex
            .split('')
            .map((c: string) => c + c)
            .join('')
        : cleanHex;

    if (fullHex.length !== 6) return null;

    return {
      r: parseInt(fullHex.substring(0, 2), 16),
      g: parseInt(fullHex.substring(2, 4), 16),
      b: parseInt(fullHex.substring(4, 6), 16),
    };
  },
  // Interpolates between two RGB colors
  interpolateRgb(start: RgbColor, end: RgbColor, factor: number): string {
    const r = Math.round(start.r + (end.r - start.r) * factor);
    const g = Math.round(start.g + (end.g - start.g) * factor);
    const b = Math.round(start.b + (end.b - start.b) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  },
  // Picks a random color from the provided array
  getRandomColor(colors: string[]): string {
    return colors[Math.floor(Math.random() * colors.length)];
  },
};

interface AnimationOptions {
  colors?: string[];
  speed?: number;
  smooth?: boolean;
  blockSize?: [number, number];
  batchCount?: [number, number];
  distance?: [number, number];
  randomShiftDirection?: boolean;
  shiftSpeed?: number;
  shiftInterval?: [number, number];
}

interface ShiftBlock {
  indices: number[];
  direction: 1 | -1;
  pixelDistance: number;
  currentOffset: number;
  targetOffset: number;
}

interface ShiftBatch {
  type: 'row' | 'col';
  blocks: ShiftBlock[];
  active: boolean;
}

const useMatrixAnimation = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: AnimationOptions
) => {
  const {
    colors = ['#2b4539', '#61dca3', '#61b3dc'],
    speed = 50,
    smooth = true,
    blockSize = [1, 3],
    batchCount = [3, 5],
    distance = [2, 9],
    randomShiftDirection = true,
    shiftSpeed = 2,
    shiftInterval = [500, 1000],
  } = options;

  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const lastShiftEndTime = useRef<number>(0);
  const nextShiftInterval = useRef<number>(shiftInterval[0]);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const gridRef = useRef({ cols: 0, rows: 0, width: 0, height: 0 });
  const shiftBatchRef = useRef<ShiftBatch | null>(null);

  // Memoize the getRandomColor function to ensure stability
  const getRandomColorMemoized = useCallback(() => ColorUtils.getRandomColor(colors), [colors]);

  // Data manipulation helpers
  const rotateGrid = (type: 'row' | 'col', indices: number[], direction: 1 | -1, steps: number) => {
    const { cols, rows } = gridRef.current;
    if (type === 'row') {
      indices.forEach(rowIndex => {
        const start = rowIndex * cols;
        const row = particlesRef.current.slice(start, start + cols);
        const effectiveSteps = (direction === 1 ? steps : -steps) % cols;
        const rotated = new Array(cols);
        for (let i = 0; i < cols; i++) {
          let newPos = (i + effectiveSteps) % cols;
          if (newPos < 0) newPos += cols;
          rotated[newPos] = row[i];
        }
        for (let i = 0; i < cols; i++) {
          particlesRef.current[start + i] = rotated[i];
        }
      });
    } else {
      // Optimizing col rotation to reduce array allocations
      indices.forEach(colIndex => {
        const col = new Array(rows);
        for (let r = 0; r < rows; r++) col[r] = particlesRef.current[r * cols + colIndex];

        const effectiveSteps = (direction === 1 ? steps : -steps) % rows;
        const rotated = new Array(rows);

        for (let i = 0; i < rows; i++) {
          let newPos = (i + effectiveSteps) % rows;
          if (newPos < 0) newPos += rows;
          rotated[newPos] = col[i];
        }
        for (let r = 0; r < rows; r++) {
          particlesRef.current[r * cols + colIndex] = rotated[r];
        }
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    contextRef.current = context;

    // This function initializes or re-initializes the particle grid
    const setup = (width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      context.font = `${FONT_SIZE}px monospace`;
      context.textBaseline = 'top';

      const cols = Math.ceil(width / CHAR_WIDTH);
      const rows = Math.ceil(height / CHAR_HEIGHT);
      gridRef.current = { cols, rows, width, height };

      particlesRef.current = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const char = CHARACTER_SET[Math.floor(Math.random() * CHARACTER_SET.length)];
          const color = getRandomColorMemoized();
          const targetColor = getRandomColorMemoized();
          particlesRef.current.push(new Particle(char, color, targetColor));
        }
      }
    };

    // The main animation loop
    const animate = (timestamp: number) => {
      let needsRedraw = false;
      const elapsed = timestamp - lastUpdateTime.current;

      // Update a batch of particles based on the speed setting
      if (elapsed > speed) {
        const updateCount = Math.max(1, Math.floor(particlesRef.current.length * 0.05));
        for (let i = 0; i < updateCount; i++) {
          // Pick a random particle, but if it's currently moving, maybe skip?
          // Actually, color glitching while moving is cool.
          const index = Math.floor(Math.random() * particlesRef.current.length);
          const particle = particlesRef.current[index];
          if (particle) {
            particle.randomizeCharacter();
            particle.setNewTargetColor(getRandomColorMemoized(), smooth);
          }
        }
        lastUpdateTime.current = timestamp;
        needsRedraw = true;
      }

      // -----------------------------------------------------------------------
      // SHIFT LOGIC - Updated for Multi-Block Non-Overlapping
      // -----------------------------------------------------------------------
      if (Math.abs(shiftSpeed) > 0) {
        // 1. Generate new batch if none active
        if (!shiftBatchRef.current) {
          // Check interval
          if (timestamp - lastShiftEndTime.current > nextShiftInterval.current) {
            const type = Math.random() > 0.5 ? 'row' : 'col';
            const { rows, cols } = gridRef.current;
            const limit = type === 'row' ? rows : cols;
            const blocks: ShiftBlock[] = [];
            const usedIndices = new Set<number>();

            const [minBatch, maxBatch] = batchCount;
            const batchCountVal = Math.floor(Math.random() * (maxBatch - minBatch + 1)) + minBatch;

            for (let b = 0; b < batchCountVal; b++) {
              // Try to find a free spot
              let attempts = 0;
              while (attempts < 10) {
                const [minBlock, maxBlock] = blockSize;
                const size = Math.floor(Math.random() * (maxBlock - minBlock + 1)) + minBlock;
                const start = Math.floor(Math.random() * (limit - size));

                // Check collision
                let collision = false;
                for (let i = 0; i < size; i++) {
                  if (usedIndices.has(start + i)) {
                    collision = true;
                    break;
                  }
                }

                if (!collision) {
                  // Register
                  const currentIndices: number[] = [];
                  for (let i = 0; i < size; i++) {
                    usedIndices.add(start + i);
                    currentIndices.push(start + i);
                  }

                  // Calculate direction based on randomShiftDirection
                  // If randomShiftDirection is true, use random. Else, default to 1.
                  const direction = randomShiftDirection ? (Math.random() > 0.5 ? 1 : -1) : 1;

                  const [minD, maxD] = distance;
                  const units = Math.floor(Math.random() * (maxD - minD + 1)) + minD;
                  const pixelDistance = units * (type === 'row' ? CHAR_WIDTH : CHAR_HEIGHT);

                  blocks.push({
                    indices: currentIndices,
                    direction,
                    pixelDistance,
                    targetOffset: pixelDistance,
                    currentOffset: 0,
                  });
                  break; // Success for this block
                }
                attempts++;
              }
            }

            if (blocks.length > 0) {
              shiftBatchRef.current = {
                type,
                blocks,
                active: true,
              };
            }
          }
        }
        // 2. Animate existing batch
        else {
          const batch = shiftBatchRef.current;
          let allFinished = true;

          batch.blocks.forEach(block => {
            if (block.currentOffset < block.targetOffset) {
              // Apply shift speed
              block.currentOffset += shiftSpeed;

              if (block.currentOffset > block.targetOffset) {
                block.currentOffset = block.targetOffset;
              }
              allFinished = false;
            }
          });

          if (allFinished) {
            // Apply logical rotation for all blocks
            batch.blocks.forEach(block => {
              const unitSize = batch.type === 'row' ? CHAR_WIDTH : CHAR_HEIGHT;
              const steps = Math.round(block.targetOffset / unitSize);
              rotateGrid(batch.type, block.indices, block.direction, steps);
            });
            shiftBatchRef.current = null;
            lastShiftEndTime.current = timestamp;

            // Set next interval
            const [minInterval, maxInterval] = shiftInterval;
            nextShiftInterval.current =
              Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
          }
          needsRedraw = true;
        }
      } else {
        if (shiftBatchRef.current) shiftBatchRef.current = null;
      }

      // Handle smooth color transitions for any active particles
      if (smooth) {
        particlesRef.current.forEach(p => {
          if (p?.updateColorTransition()) {
            needsRedraw = true;
          }
        });
      }

      // -----------------------------------------------------------------------
      // DRAW
      // -----------------------------------------------------------------------
      if (needsRedraw) {
        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = canvas.width / dpr;
        const canvasHeight = canvas.height / dpr;

        context.clearRect(0, 0, canvasWidth, canvasHeight);

        const { cols, rows } = gridRef.current;
        const totalW = cols * CHAR_WIDTH;
        const totalH = rows * CHAR_HEIGHT;

        // Build lookup map for active shifts
        const rowShiftMap = new Map<number, number>(); // index -> offset (signed)
        const colShiftMap = new Map<number, number>();

        if (shiftBatchRef.current) {
          const batch = shiftBatchRef.current;
          batch.blocks.forEach(block => {
            const offset = block.currentOffset * block.direction;
            block.indices.forEach(idx => {
              if (batch.type === 'row') rowShiftMap.set(idx, offset);
              else colShiftMap.set(idx, offset);
            });
          });
        }

        // Draw loop
        for (let r = 0; r < rows; r++) {
          const rOffset = rowShiftMap.get(r) || 0;

          for (let c = 0; c < cols; c++) {
            const cOffset = colShiftMap.get(c) || 0;
            const p = particlesRef.current[r * cols + c];

            // Calculate wrapped position
            let x = (c * CHAR_WIDTH + rOffset) % totalW;
            let y = (r * CHAR_HEIGHT + cOffset) % totalH;

            if (x < 0) x += totalW;
            if (y < 0) y += totalH;

            x = x % totalW;
            y = y % totalH;

            // Draw main
            p?.draw(context, x, y);

            // Wrap-around clones for edge continuity
            if (p) {
              if (x < CHAR_WIDTH) p.draw(context, x + totalW, y); // Left edge -> Right ghost
              if (x > totalW - CHAR_WIDTH) p.draw(context, x - totalW, y); // Right edge -> Left ghost

              if (y < CHAR_HEIGHT) p.draw(context, x, y + totalH);
              if (y > totalH - CHAR_HEIGHT) p.draw(context, x, y - totalH);
            }
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Use ResizeObserver for efficient resize handling
    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setup(width, height);
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Start the animation
    animate(0);

    // Cleanup function to stop the animation and observer
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      resizeObserver.disconnect();
    };
  }, [
    colors,
    speed,
    smooth,
    blockSize,
    batchCount,
    distance,
    randomShiftDirection,
    shiftSpeed,
    shiftInterval,
    canvasRef,
    getRandomColorMemoized,
  ]); // Dependencies for the effect
};

interface GlitchScreenProps {
  glitchColors: string[];
  glitchSpeed: number;
  smooth: boolean;
  centerVignette?: boolean;
  outerVignette?: boolean;
  blockSize?: [number, number];
  batchCount?: [number, number];
  distance?: [number, number];
  randomShiftDirection?: boolean;
  shiftSpeed?: number;
  shiftInterval?: [number, number];
}

const GlitchScreen = ({
  glitchColors,
  glitchSpeed,
  smooth,
  centerVignette = false,
  outerVignette = true,
  blockSize,
  batchCount,
  distance,
  randomShiftDirection,
  shiftSpeed,
  shiftInterval,
}: GlitchScreenProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // The custom hook handles all the complex animation logic
  useMatrixAnimation(canvasRef, {
    colors: glitchColors,
    speed: glitchSpeed,
    smooth: smooth,
    blockSize,
    batchCount,
    distance,
    randomShiftDirection,
    shiftSpeed,
    shiftInterval,
  });

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      {/* Vignette overlays for visual effect */}
      {outerVignette && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,_rgba(0,0,0,0)_60%,_rgba(0,0,0,1)_100%)]"></div>
      )}
      {centerVignette && (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,_rgba(0,0,0,0.8)_0%,_rgba(0,0,0,0)_60%)]"></div>
      )}
    </div>
  );
};
export default GlitchScreen;
