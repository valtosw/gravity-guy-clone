import React, { useRef, useEffect, useState } from "react";
import { GameState, Difficulty, ObstacleType } from "../types";
import type { Player, Platform, Coin, Obstacle } from "../types";
import { useGameLogic } from "../hooks/useGameLogic";

const CANVAS_WIDTH = 1500;
const CANVAS_HEIGHT = 670;

const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
  ctx.save();
  ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
  ctx.rotate(player.visualRotation);
  ctx.fillStyle = "#F94144";
  ctx.fillRect(
    -player.width / 2,
    -player.height / 2,
    player.width,
    player.height
  );
  ctx.restore();
};

const drawPlatforms = (
  ctx: CanvasRenderingContext2D,
  platforms: Platform[]
) => {
  ctx.fillStyle = "#43AA8B";
  platforms.forEach((p) => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });
};

const drawCoins = (ctx: CanvasRenderingContext2D, coins: Coin[]) => {
  ctx.fillStyle = "#F9C74F";
  coins.forEach((c) => {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
    ctx.fill();
  });
};

const drawObstacles = (
  ctx: CanvasRenderingContext2D,
  obstacles: Obstacle[]
) => {
  obstacles.forEach((o) => {
    if (o.type === ObstacleType.MovingVertical) {
      ctx.fillStyle = "#d96c00";
    } else if (o.type === ObstacleType.MovingHorizontal) {
      ctx.fillStyle = "#90BE6D";
    } else {
      ctx.fillStyle = "#F8961E";
    }
    ctx.fillRect(o.x, o.y, o.width, o.height);
  });
};

const buttonStyle = {
  width: 160,
  height: 60,
  gap: 20,
  font: "bold 18px sans-serif",
  textColor: "#FFFFFF",
};

const startScreenButtons = {
  easy: {
    x: (CANVAS_WIDTH - buttonStyle.width * 3 - buttonStyle.gap * 2) / 2,
    y: 300,
    ...buttonStyle,
    text: "Easy",
    difficulty: Difficulty.Easy,
    color: "#43AA8B",
  },
  medium: {
    x:
      (CANVAS_WIDTH - buttonStyle.width * 3 - buttonStyle.gap * 2) / 2 +
      buttonStyle.width +
      buttonStyle.gap,
    y: 300,
    ...buttonStyle,
    text: "MID",
    difficulty: Difficulty.Medium,
    color: "#F8961E",
  },
  hard: {
    x:
      (CANVAS_WIDTH - buttonStyle.width * 3 - buttonStyle.gap * 2) / 2 +
      (buttonStyle.width + buttonStyle.gap) * 2,
    y: 300,
    ...buttonStyle,
    text: "Hard",
    difficulty: Difficulty.Hard,
    color: "#F94144",
  },
};

const gameOverButtons = {
  tryAgain: {
    x: CANVAS_WIDTH / 2 - buttonStyle.width - buttonStyle.gap / 2,
    y: 350,
    ...buttonStyle,
    text: "Try Again",
    color: "#F94144",
  },
  menu: {
    x: CANVAS_WIDTH / 2 + buttonStyle.gap / 2,
    y: 350,
    ...buttonStyle,
    text: "Main Menu",
    color: "#577590",
  },
};

const levelCompleteButtons = {
  playAgain: {
    x: CANVAS_WIDTH / 2 - buttonStyle.width - buttonStyle.gap / 2,
    y: 350,
    ...buttonStyle,
    text: "Play Again",
    color: "#43AA8B",
  },
  menu: {
    x: CANVAS_WIDTH / 2 + buttonStyle.gap / 2,
    y: 350,
    ...buttonStyle,
    text: "Main Menu",
    color: "#577590",
  },
};

type Button = {
  text: string;
  color: string;
  width: number;
  height: number;
  gap: number;
  font: string;
  textColor: string;
  x: number;
  y: number;
  difficulty?: Difficulty;
};

const drawButton = (
  ctx: CanvasRenderingContext2D,
  button: Button,
  isHovered: boolean
) => {
  ctx.fillStyle = isHovered ? "#FFFFFF" : button.color;
  ctx.fillRect(button.x, button.y, button.width, button.height);
  ctx.font = button.font;
  ctx.fillStyle = isHovered ? button.color : button.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    button.text,
    button.x + button.width / 2,
    button.y + button.height / 2
  );
};

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    gameState,
    player,
    platforms,
    score,
    coins,
    obstacles,
    startGame,
    goToMenu,
    difficulty,
  } = useGameLogic(CANVAS_WIDTH, CANVAS_HEIGHT);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };
    canvas.addEventListener("mousemove", handleMouseMove);
    return () => canvas.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isInside = (pos: { x: number; y: number }, rect: Button) => {
      return (
        pos.x > rect.x &&
        pos.x < rect.x + rect.width &&
        pos.y < rect.y + rect.height &&
        pos.y > rect.y
      );
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      if (gameState === GameState.StartScreen) {
        Object.values(startScreenButtons).forEach((btn) => {
          if (isInside(pos, btn)) startGame(btn.difficulty);
        });
      } else if (gameState === GameState.GameOver) {
        if (isInside(pos, gameOverButtons.tryAgain)) startGame(difficulty);
        else if (isInside(pos, gameOverButtons.menu)) goToMenu();
      } else if (gameState === GameState.LevelComplete) {
        if (isInside(pos, levelCompleteButtons.playAgain))
          startGame(difficulty);
        else if (isInside(pos, levelCompleteButtons.menu)) goToMenu();
      }
    };

    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [gameState, startGame, goToMenu, difficulty]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0D0C1D";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const isButtonHovered = (button: Button) => {
      return (
        mousePos.x > button.x &&
        mousePos.x < button.x + button.width &&
        mousePos.y > button.y &&
        mousePos.y < button.y + button.height
      );
    };

    if (gameState !== GameState.StartScreen) {
      drawPlatforms(ctx, platforms);
      drawCoins(ctx, coins);
      drawObstacles(ctx, obstacles);
      if (player.x) drawPlayer(ctx, player);
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (gameState === GameState.StartScreen) {
      ctx.fillStyle = "rgba(13, 12, 29, 0.8)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.font = '24px "Helvetica Neue", sans-serif';
      ctx.fillStyle = "#A0A0A0";
      ctx.fillText("Select a difficulty to begin", CANVAS_WIDTH / 2, 250);

      Object.values(startScreenButtons).forEach((btn) =>
        drawButton(ctx, btn, isButtonHovered(btn))
      );

      ctx.font = '16px "Helvetica Neue", sans-serif';
      ctx.fillStyle = "#808080";
      ctx.fillText(
        "Controls: Click or Space to flip gravity",
        CANVAS_WIDTH / 2,
        450
      );
    } else if (gameState === GameState.LevelComplete) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.font = '50px "Helvetica Neue", sans-serif';
      ctx.fillStyle = "#43AA8B";
      ctx.fillText("Level Complete", CANVAS_WIDTH / 2, 200);

      ctx.font = '30px "Helvetica Neue", sans-serif';
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, 280);

      Object.values(levelCompleteButtons).forEach((btn) =>
        drawButton(ctx, btn, isButtonHovered(btn))
      );
    } else if (gameState === GameState.GameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.font = '50px "Helvetica Neue", sans-serif';
      ctx.fillStyle = "#F94144";
      ctx.fillText("Game Over", CANVAS_WIDTH / 2, 200);

      ctx.font = '30px "Helvetica Neue", sans-serif';
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2, 280);

      Object.values(gameOverButtons).forEach((btn) =>
        drawButton(ctx, btn, isButtonHovered(btn))
      );
    } else if (gameState === GameState.Playing) {
      ctx.font = '24px "Helvetica Neue", sans-serif';
      ctx.fillStyle = "#F9C74F";
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(`Score: ${score}`, CANVAS_WIDTH - 20, 20);
    }
  }, [
    gameState,
    player,
    platforms,
    coins,
    obstacles,
    score,
    mousePos,
    difficulty,
    startGame,
    goToMenu,
  ]);

  return (
    <div
      className="rounded-lg shadow-2xl overflow-hidden border-2 border-[#43AA8B]/50"
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
    >
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
    </div>
  );
};

export default Game;
