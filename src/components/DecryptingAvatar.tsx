'use client';
import React, { useEffect, useRef, useState } from 'react';

interface DecryptingAvatarProps {
  /** Alt text for accessibility */
  alt?: string;
  /** Image size */
  size?: number;
  /** Animation duration in frames (default: 45 frames) */
  speed?: number;
  /** Grid size (number of blocks per row/col, default: 8) */
  gridSize?: number;
  /** Source image URL for mask detection */
  src?: string;
  /** Whether to use image mask for transparent pixel detection (default: true) */
  mask?: boolean;
  /** Whether to preserve image aspect ratio (adjust height based on width) */
  preserveAspectRatio?: boolean;
  /** Children element to display when decryption is complete */
  children?: React.ReactNode;
  /** Custom CSS class */
  className?: string;
}

interface BlockState {
  id: number;
  isRevealed: boolean;
  offsetX: number;
  offsetY: number;
  charIndex: number;
  colorInvert: boolean;
  revealOrder: number;
  hasContent: boolean;
}

export function DecryptingAvatar({
  alt = 'Avatar',
  size = 200,
  speed = 45,
  gridSize = 8,
  src,
  mask = true,
  preserveAspectRatio = false,
  children,
  className = '',
}: DecryptingAvatarProps) {
  // Height state for aspect ratio preservation
  const [containerHeight, setContainerHeight] = useState<number | null>(null);

  // Initialize blocks with all blocks in "not revealed" state immediately
  // This ensures the encrypted/glitched state is visible from page load
  const [blocks, setBlocks] = useState<BlockState[]>(() => {
    const initialBlocks: BlockState[] = [];
    const GLITCH_CHARS = '█▓▒░▀▄▌▐■□●○▫▲△▼▽◆◇◎◈★☆';

    for (let i = 0; i < gridSize * gridSize; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const randomOffset = Math.random() * 0.7;
      const spatialOffset = ((row + col) / (gridSize * 2)) * 0.3;

      initialBlocks.push({
        id: i,
        isRevealed: false,
        offsetX: (Math.random() - 0.5) * 10,
        offsetY: (Math.random() - 0.5) * 10,
        charIndex: Math.floor(Math.random() * GLITCH_CHARS.length),
        colorInvert: Math.random() > 0.5,
        revealOrder: Math.floor((randomOffset + spatialOffset) * speed),
        hasContent: true, // Initially assume all blocks have content
      });
    }
    return initialBlocks;
  });
  // Delay decryption animation to ensure encrypted state is visible first
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Start decryption animation after a brief delay to show encrypted state first
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDecrypting(true);
    }, 100); // Brief delay to ensure encrypted state is visible
    return () => clearTimeout(timer);
  }, []);

  // ASCII characters for glitch effect
  const GLITCH_CHARS = '█▓▒░▀▄▌▐■□●○▫▲△▼▽◆◇◎◈★☆';

  // Generate blocks for decryption effect
  const generateBlocks = (hasContentMask: boolean[] | null): BlockState[] => {
    const totalBlocks = gridSize * gridSize;
    const newBlocks: BlockState[] = [];

    for (let i = 0; i < totalBlocks; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;

      const randomOffset = Math.random() * 0.7;
      const spatialOffset = ((row + col) / (gridSize * 2)) * 0.3;

      newBlocks.push({
        id: i,
        isRevealed: false,
        offsetX: (Math.random() - 0.5) * 10,
        offsetY: (Math.random() - 0.5) * 10,
        charIndex: Math.floor(Math.random() * GLITCH_CHARS.length),
        colorInvert: Math.random() > 0.5,
        revealOrder: Math.floor((randomOffset + spatialOffset) * speed),
        hasContent: hasContentMask ? hasContentMask[i] : true,
      });
    }

    return newBlocks;
  };

  // Load image and analyze transparency
  useEffect(() => {
    if (!src || !mask) {
      // If no src or mask disabled, all blocks have content
      setBlocks(generateBlocks(null));
      return;
    }

    // Load image for mask analysis
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      imageRef.current = img;
      analyzeImageMask(img);
    };

    img.onerror = () => {
      // If image fails to load, assume all blocks have content
      setBlocks(generateBlocks(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, mask, gridSize, speed]);

  // Analyze image transparency for each block
  const analyzeImageMask = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to image size for accurate pixel analysis
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    // Update container height if preserving aspect ratio
    if (preserveAspectRatio) {
      setContainerHeight((img.naturalHeight / img.naturalWidth) * size);
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    const blockWidth = img.naturalWidth / gridSize;
    const blockHeight = img.naturalHeight / gridSize;
    const hasContentMask: boolean[] = [];

    for (let i = 0; i < gridSize * gridSize; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;

      // Analyze pixels in this block region
      const startX = Math.floor(col * blockWidth);
      const endX = Math.floor((col + 1) * blockWidth);
      const startY = Math.floor(row * blockHeight);
      const endY = Math.floor((row + 1) * blockHeight);

      let hasOpaquePixel = false;

      for (let y = startY; y < endY && y < img.naturalHeight; y++) {
        for (let x = startX; x < endX && x < img.naturalWidth; x++) {
          const pixelIndex = (y * img.naturalWidth + x) * 4;
          const alpha = pixels[pixelIndex + 3];

          if (alpha > 0) {
            hasOpaquePixel = true;
            break;
          }
        }
        if (hasOpaquePixel) break;
      }

      hasContentMask.push(hasOpaquePixel);
    }

    setBlocks(generateBlocks(hasContentMask));
  };

  // Animation loop
  useEffect(() => {
    if (blocks.length === 0) return;

    let animationFrameId: number;
    let frame = 0;

    const draw = () => {
      if (frame > speed) {
        setIsComplete(true);
        return;
      }

      setBlocks(prevBlocks =>
        prevBlocks.map(block => ({
          ...block,
          isRevealed: block.revealOrder <= frame,
          charIndex: (block.charIndex + 1) % GLITCH_CHARS.length,
        }))
      );

      frame++;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [blocks.length, speed]);

  const blockWidth = size / gridSize;
  const currentHeight = preserveAspectRatio && containerHeight ? containerHeight : size;
  const blockHeight = currentHeight / gridSize;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width: size, height: currentHeight }}
      role="img"
      aria-label={alt}
    >
      {/* Hidden canvas for mask analysis */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Base layer - original content (z-0) - only visible during decryption or after completion */}
      <div
        className={`absolute inset-0 z-0 overflow-hidden ${isDecrypting || isComplete ? '' : 'hidden'}`}
      >
        {children}
      </div>

      {/* Decryption effect overlay (z-10) */}
      <div
        className={`absolute inset-0 z-10 grid`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {blocks.map(block => (
          <div
            key={block.id}
            className="relative overflow-hidden"
            style={{
              width: blockWidth,
              height: blockHeight,
              transform: block.isRevealed
                ? 'translate(0, 0)'
                : `translate(${block.offsetX}px, ${block.offsetY}px)`,
              opacity: block.isRevealed ? 0 : 1, // Revealed blocks are transparent to show base layer
              transition: 'opacity 0.3s ease-out',
              // Hide blocks without content when decrypting
              visibility: !block.hasContent && !block.isRevealed ? 'hidden' : 'visible',
            }}
          >
            {/* Glitch character - shows when NOT revealed (covers the base layer) */}
            {!block.isRevealed && block.hasContent && (
              <div
                className="absolute inset-0 flex items-center justify-center text-xs font-mono"
                style={{
                  backgroundColor: block.colorInvert ? '#fff' : '#000',
                  color: block.colorInvert ? '#000' : '#fff',
                }}
              >
                {GLITCH_CHARS[block.charIndex % GLITCH_CHARS.length]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Complete overlay (z-20) - shows full original content after animation */}
      {isComplete && (
        <div className="absolute inset-0 z-20 overflow-hidden">{children}</div>
      )}
    </div>
  );
}
