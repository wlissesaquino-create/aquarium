import React, { useEffect, useRef } from "react";

export const AquariumBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const groundHeight = 140;

    // partículas (bolhas)
    const bubbles = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * (height - groundHeight),
      r: 2 + Math.random() * 6,
      speed: 0.2 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.6,
      opacity: 0.2 + Math.random() * 0.4,
    }));

    const drawBackground = () => {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#0d47a1");
      grad.addColorStop(0.5, "#1976d2");
      grad.addColorStop(1, "#64b5f6");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    };

    const drawGround = () => {
      const groundY = height - groundHeight;
      ctx.fillStyle = "#4a3f35";
      ctx.fillRect(0, groundY, width, groundHeight);

      // pedras
      for (let i = 0; i < 30; i++) {
        const px = Math.random() * width;
        const py = groundY + 20 + Math.random() * (groundHeight - 30);
        const pr = 5 + Math.random() * 15;
        ctx.beginPath();
        ctx.ellipse(px, py, pr * 1.3, pr, 0, 0, Math.PI * 2);
        ctx.fillStyle = ["#5b4d42", "#3d332b", "#6c5a4e"][Math.floor(Math.random() * 3)];
        ctx.fill();
      }

      // algas
      for (let i = 0; i < 10; i++) {
        const baseX = i * (width / 10) + Math.random() * 30;
        const baseY = height - 10;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.bezierCurveTo(
          baseX - 20, baseY - 80,
          baseX + 20, baseY - 140,
          baseX + (Math.random() * 20 - 10), baseY - 180 - Math.random() * 50
        );
        ctx.strokeStyle = ["#1b8f3d", "#249e4f", "#1f8444"][Math.floor(Math.random() * 3)];
        ctx.lineWidth = 6;
        ctx.stroke();
      }
    };

    const drawBubbles = () => {
      for (let b of bubbles) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${b.opacity})`;
        ctx.fill();

        b.y -= b.speed;
        b.x += b.drift;

        if (b.y < 0) {
          b.y = height - groundHeight - 5;
          b.x = Math.random() * width;
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      drawBackground();
      drawGround();
      drawBubbles();
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 1 }} />;
};