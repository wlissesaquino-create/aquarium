import React, { useEffect, useRef } from "react";

export const AquariumBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Oceano - bolhas
    const oceanBubbles = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 4 + Math.random() * 8,
      speed: 0.3 + Math.random() * 0.7,
      opacity: 50 + Math.random() * 100,
    }));

    // Areia do fundo - contorno irregular
    const oceanSand = Array.from({ length: Math.ceil(width / 10) + 1 }).map(() => 
      height - 80 - Math.random() * 40
    );

    // Função para interpolar cores (equivalente ao lerpColor do p5.js)
    const lerpColor = (c1: [number, number, number], c2: [number, number, number], t: number): [number, number, number] => {
      return [
        c1[0] + (c2[0] - c1[0]) * t,
        c1[1] + (c2[1] - c1[1]) * t,
        c1[2] + (c2[2] - c1[2]) * t
      ];
    };

    // Função para mapear valores (equivalente ao map do p5.js)
    const mapValue = (value: number, start1: number, stop1: number, start2: number, stop2: number): number => {
      return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    };

    const drawOcean = () => {
      const c1: [number, number, number] = [20, 50, 100];
      const c2: [number, number, number] = [10, 30, 60];
      
      // Desenhar gradiente linha por linha
      for (let y = 0; y < height; y++) {
        const inter = mapValue(y, 0, height, 0, 1);
        const c = lerpColor(c1, c2, inter);
        ctx.strokeStyle = `rgb(${Math.floor(c[0])}, ${Math.floor(c[1])}, ${Math.floor(c[2])})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Desenhar bolhas
      for (let bubble of oceanBubbles) {
        ctx.fillStyle = `rgba(180, 220, 255, ${bubble.opacity / 255})`;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
        ctx.fill();
        
        bubble.y -= bubble.speed;
        bubble.x += Math.sin(bubble.y * 0.01) * 0.5;
        
        if (bubble.y < -20) {
          bubble.y = height + 20;
          bubble.x = Math.random() * width;
        }
      }

      // Desenhar areia do fundo
      ctx.fillStyle = "rgb(45, 35, 25)";
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let i = 0; i < oceanSand.length; i++) {
        ctx.lineTo(i * 10, oceanSand[i]);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      drawSeaweed();
    };

    const drawSeaweed = () => {
      ctx.strokeStyle = "rgb(30, 80, 40)";
      ctx.lineWidth = 3;
      
      for (let x = 100; x < width; x += 200) {
        const baseY = height - 60;
        const waveOffset = Math.sin(Date.now() * 0.001 + x * 0.01) * 10;
        
        ctx.beginPath();
        let firstPoint = true;
        for (let y = baseY; y > baseY - 150; y -= 10) {
          const offsetX = Math.sin((y - baseY) * 0.05 + Date.now() * 0.002) * 15 + waveOffset;
          if (firstPoint) {
            ctx.moveTo(x + offsetX, y);
            firstPoint = false;
          } else {
            ctx.lineTo(x + offsetX, y);
          }
        }
        ctx.stroke();
      }
      ctx.lineWidth = 1;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      drawOcean();
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      // Recriar areia com nova largura
      oceanSand.length = Math.ceil(width / 10) + 1;
      for (let i = 0; i < oceanSand.length; i++) {
        oceanSand[i] = height - 80 - Math.random() * 40;
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 1 }} />;
};