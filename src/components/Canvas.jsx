import React, { useEffect, useRef, useState } from "react";

const Canvas = () => {
  const svgWidth = 800;
  const svgHeight = 600;

  // Player
  const [player, setPlayer] = useState({ x: svgWidth / 2, y: svgHeight - 70 });
  const [playerDirection, setPlayerDirection] = useState("up"); // last movement direction

  // Aliens
  const initialAliens = Array.from({ length: 20 }, () => ({
    x: Math.random() * svgWidth,
    y: Math.random() * (svgHeight / 2),
    speed: 1 + Math.random() * 2,
  }));
  const [aliens, setAliens] = useState(initialAliens);

  // Bullets
  const [bullets, setBullets] = useState([]);

  // Terrain obstacles
  const terrain = [
    { x: 200, y: 300, width: 100, height: 20 },
    { x: 400, y: 150, width: 200, height: 20 },
    { x: 600, y: 400, width: 150, height: 20 },
  ];

  const playerRef = useRef(player);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // Check collision with terrain
  const collides = (x, y, size = 10) => {
    return terrain.some(
      (t) =>
        x + size > t.x &&
        x - size < t.x + t.width &&
        y + size > t.y &&
        y - size < t.y + t.height
    );
  };

  // Player movement & shooting
  useEffect(() => {
    const handleKey = (e) => {
      let newDir = playerDirection;
      setPlayer((p) => {
        let x = p.x,
          y = p.y;
        const speed = 10;

        switch (e.key.toLowerCase()) {
          case "w":
            y = Math.max(0, p.y - speed);
            newDir = "up";
            break;
          case "s":
            y = Math.min(svgHeight, p.y + speed);
            newDir = "down";
            break;
          case "a":
            x = Math.max(0, p.x - speed);
            newDir = "left";
            break;
          case "d":
            x = Math.min(svgWidth, p.x + speed);
            newDir = "right";
            break;
          default:
            break;
        }

        // Terrain collision check
        if (!collides(x, y)) return { x, y };
        return p; // if collision, stay
      });

      setPlayerDirection(newDir);

      // Shoot bullet
      if (e.key === " ") {
        let dx = 0,
          dy = 0;
        switch (newDir) {
          case "up":
            dy = -10;
            break;
          case "down":
            dy = 10;
            break;
          case "left":
            dx = -10;
            break;
          case "right":
            dx = 10;
            break;
          default:
            break;
        }
        setBullets((b) => [
          ...b,
          { x: playerRef.current.x, y: playerRef.current.y, r: 5, dx, dy },
        ]);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [playerDirection]);

  // Move bullets
  useEffect(() => {
    const interval = setInterval(() => {
      setBullets((prev) =>
        prev
          .map((b) => {
            const nx = b.x + b.dx;
            const ny = b.y + b.dy;
            // remove bullet if hits terrain
            if (collides(nx, ny)) return null;
            return { ...b, x: nx, y: ny };
          })
          .filter(Boolean)
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Aliens move towards player
  useEffect(() => {
    const interval = setInterval(() => {
      setAliens((prev) =>
        prev.map((alien) => {
          const dx = player.x - alien.x;
          const dy = player.y - alien.y;
          const distance = Math.hypot(dx, dy);
          const speed = alien.speed;
          let nx = alien.x + (dx / distance) * speed;
          let ny = alien.y + (dy / distance) * speed;

          // Avoid terrain collision
          if (collides(nx, ny)) {
            nx = alien.x;
            ny = alien.y;
          }

          return { ...alien, x: nx, y: ny };
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, [player]);

  // Bullet-alien collisions
  useEffect(() => {
    const interval = setInterval(() => {
      setAliens((prevAliens) =>
        prevAliens.filter(
          (alien) =>
            !bullets.some(
              (b) => Math.hypot(alien.x - b.x, alien.y - b.y) < 15 + b.r
            )
        )
      );
    }, 50);
    return () => clearInterval(interval);
  }, [bullets]);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      style={{ border: "2px solid black", backgroundColor: "#000" }}
    >
      {/* Terrain */}
      {terrain.map((t, i) => (
        <rect
          key={i}
          x={t.x}
          y={t.y}
          width={t.width}
          height={t.height}
          fill="#555"
        />
      ))}

      {/* Player */}
      <g transform={`translate(${player.x},${player.y})`}>
        <circle
          cx="0"
          cy="-10"
          r="8"
          fill="#a0cfff"
          stroke="white"
          strokeWidth="2"
        />
        <ellipse cx="0" cy="-10" rx="5" ry="6" fill="#004080" opacity="0.5" />
        <rect
          x="-6"
          y="-2"
          width="12"
          height="22"
          fill="#c00"
          stroke="white"
          strokeWidth="1"
        />
        <line x1="-10" y1="0" x2="10" y2="0" stroke="#c00" strokeWidth="3" />
        <line x1="-5" y1="20" x2="-5" y2="30" stroke="#c00" strokeWidth="3" />
        <line x1="5" y1="20" x2="5" y2="30" stroke="#c00" strokeWidth="3" />
      </g>

      {/* Aliens */}
      {aliens.map((alien, i) => (
        <g key={i} transform={`translate(${alien.x},${alien.y})`}>
          <polygon
            points="-12,12 0,-12 12,12"
            fill="lime"
            stroke="darkgreen"
            strokeWidth="1"
          />
          <circle cx="0" cy="-4" r="4" fill="green" />
        </g>
      ))}

      {/* Bullets */}
      {bullets.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="yellow" />
      ))}
    </svg>
  );
};

export default Canvas;
