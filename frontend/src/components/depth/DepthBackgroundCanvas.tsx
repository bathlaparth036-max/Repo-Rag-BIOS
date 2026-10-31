import React, { useEffect, useRef } from "react";

interface Fish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  ascii: string;
  phase: number;
  schoolId: number;
}

interface Shark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  lines: string[];
  facingRight: boolean;
  glowColor: string;
  wiggle: number;
}

interface Jellyfish {
  x: number;
  y: number;
  vy: number;
  size: number;
  pulse: number;
  tentacles: number[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  color: string;
}

export const DepthBackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates for subtle interactive flocking
    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // 1. PARTICLES (Weightless floating bioluminescent motes)
    const particles: Particle[] = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.2 - Math.random() * 0.45, // floating gently upward
      size: 1 + Math.random() * 2,
      alpha: 0.1 + Math.random() * 0.4,
      maxAlpha: 0.3 + Math.random() * 0.5,
      color: Math.random() > 0.4 ? "#00f2fe" : "#818cf8",
    }));

    // 2. SCHOOLS OF ASCII FISH
    const fishGlyphs = [
      "><(((('>",
      ">°))))><",
      "><(((*>",
      "><>",
      ">====>",
      "•)))><",
    ];

    const fishSchool: Fish[] = [];
    const schoolCount = 3;
    for (let s = 0; s < schoolCount; s++) {
      const baseX = Math.random() * width;
      const baseY = 100 + Math.random() * (height - 200);
      const schoolDirection = Math.random() > 0.5 ? 1 : -1;
      const count = 7 + Math.floor(Math.random() * 6);

      for (let i = 0; i < count; i++) {
        fishSchool.push({
          x: baseX + (Math.random() - 0.5) * 160,
          y: baseY + (Math.random() - 0.5) * 90,
          vx: schoolDirection * (0.5 + Math.random() * 0.6),
          vy: (Math.random() - 0.5) * 0.25,
          size: 11 + Math.random() * 3,
          color: s === 0 ? "rgba(0, 242, 254, " : s === 1 ? "rgba(129, 140, 248, " : "rgba(167, 139, 250, ",
          ascii: fishGlyphs[i % fishGlyphs.length],
          phase: Math.random() * Math.PI * 2,
          schoolId: s,
        });
      }
    }

    // 3. CYBERNETIC ASCII SHARK
    const sharkRightLines = [
      "          /|                 ",
      "  ,___/\\_/ ' /               ",
      " <__     _  /  · · · ░▒▓█    ",
      "    \\__/  \\/                 ",
    ];

    const sharkLeftLines = [
      "                 |\\          ",
      "               \\ ' \\_/\\___,  ",
      "    █▓▒░ · · ·  \\  _     __> ",
      "                 \\/  \\__/    ",
    ];

    const shark: Shark = {
      x: -250,
      y: height * 0.32,
      vx: 0.85,
      vy: 0.05,
      scale: 1,
      lines: sharkRightLines,
      facingRight: true,
      glowColor: "#00f2fe",
      wiggle: 0,
    };

    // 4. BIOLUMINESCENT JELLYFISH
    const jellyfishList: Jellyfish[] = [
      { x: width * 0.15, y: height * 0.75, vy: -0.3, size: 22, pulse: 0, tentacles: [14, 18, 22, 18, 14] },
      { x: width * 0.82, y: height * 0.88, vy: -0.25, size: 28, pulse: 1.5, tentacles: [18, 24, 28, 24, 18] },
    ];

    // Grid animation offset
    let gridOffset = 0;

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // A. Floating perspective matrix grid
      gridOffset = (gridOffset + 0.15) % 40;
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.022)";
      ctx.lineWidth = 1;

      // Vertical grid lines
      for (let x = 0; x <= width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal grid lines with slight slow drift
      for (let y = gridOffset; y <= height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Matrix Coordinates & Ambient Cyber telemetry
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
      ctx.fillText("[DEPTH: 1042m // ANTIGRAVITY ENGINE ACTIVE]", 24, height - 32);
      ctx.fillText("[LATENCY: 0.04ms] [NODES: 12] [PRESENCE: GLOBAL]", width - 360, height - 32);
      ctx.restore();

      // B. Floating Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      // C. Render Jellyfish
      for (const j of jellyfishList) {
        j.pulse += 0.035;
        const currentSize = j.size + Math.sin(j.pulse) * 3;
        j.y += j.vy + Math.sin(j.pulse) * 0.15;
        if (j.y < -80) {
          j.y = height + 60;
          j.x = 80 + Math.random() * (width - 160);
        }

        ctx.save();
        ctx.font = `${Math.floor(currentSize * 0.7)}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = "rgba(129, 140, 248, 0.28)";
        ctx.shadowColor = "#818cf8";
        ctx.shadowBlur = 12;

        // Jelly bell
        ctx.fillText("╭─────╮", j.x - 24, j.y);
        ctx.fillText("│ · · │", j.x - 24, j.y + 12);
        ctx.fillText("╰─┬─┬─╯", j.x - 24, j.y + 24);

        // Tentacles waving
        ctx.fillStyle = "rgba(0, 242, 254, 0.2)";
        const wave = Math.sin(j.pulse * 2) * 4;
        ctx.fillText(` ┆ ┆ ┆`, j.x - 20 + wave * 0.5, j.y + 36);
        ctx.fillText(` ┊ ┊ ┊`, j.x - 20 - wave * 0.5, j.y + 48);
        ctx.restore();
      }

      // D. Update & Render Cybernetic Shark
      shark.wiggle += 0.04;
      shark.x += shark.vx;
      shark.y += shark.vy + Math.sin(shark.wiggle) * 0.3;

      if (shark.facingRight && shark.x > width + 280) {
        shark.facingRight = false;
        shark.vx = -0.75;
        shark.lines = sharkLeftLines;
        shark.y = 80 + Math.random() * (height * 0.6);
      } else if (!shark.facingRight && shark.x < -280) {
        shark.facingRight = true;
        shark.vx = 0.85;
        shark.lines = sharkRightLines;
        shark.y = 80 + Math.random() * (height * 0.6);
      }

      ctx.save();
      ctx.font = "13px 'JetBrains Mono', monospace";
      ctx.shadowColor = shark.glowColor;
      ctx.shadowBlur = 10;
      ctx.fillStyle = "rgba(0, 242, 254, 0.32)";

      shark.lines.forEach((line, index) => {
        const offset = Math.sin(shark.wiggle + index * 0.4) * 2;
        ctx.fillText(line, shark.x, shark.y + index * 16 + offset);
      });
      ctx.restore();

      // E. Update & Render Schools of ASCII Fish
      for (const fish of fishSchool) {
        fish.phase += 0.05;

        // Sinusoidal vertical motion
        const sway = Math.sin(fish.phase) * 0.35;
        fish.y += fish.vy + sway;
        fish.x += fish.vx;

        // Gentle cursor interaction (weightless aversion)
        const dx = fish.x - mouseX;
        const dy = fish.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130 && dist > 0) {
          const force = (130 - dist) / 130;
          fish.x += (dx / dist) * force * 2.5;
          fish.y += (dy / dist) * force * 2.5;
        }

        // Screen wrap
        if (fish.vx > 0 && fish.x > width + 100) {
          fish.x = -80;
          fish.y = 80 + Math.random() * (height - 160);
        } else if (fish.vx < 0 && fish.x < -100) {
          fish.x = width + 80;
          fish.y = 80 + Math.random() * (height - 160);
        }

        // Render Fish Glyph
        ctx.save();
        ctx.font = `${Math.floor(fish.size)}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = `${fish.color}0.38)`;
        ctx.shadowColor = "#00f2fe";
        ctx.shadowBlur = 6;

        let displayAscii = fish.ascii;
        // Flip ASCII fish if swimming left
        if (fish.vx < 0) {
          displayAscii = displayAscii
            .replace(/>/g, "<temp>")
            .replace(/</g, ">")
            .replace(/<temp>/g, "<")
            .split("")
            .reverse()
            .join("");
        }

        ctx.fillText(displayAscii, fish.x, fish.y);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-35"
      aria-hidden="true"
    />
  );
};
