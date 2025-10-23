import React, { useRef, useEffect } from 'react';
import { GameState, Difficulty, ObstacleType } from '../types';
import type { Player, Platform, Coin, Obstacle } from '../types';
import { useGameLogic } from '../hooks/useGameLogic';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate(player.visualRotation);
    ctx.fillStyle = '#F94144';
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();
};

const drawPlatforms = (ctx: CanvasRenderingContext2D, platforms: Platform[]) => {
    ctx.fillStyle = '#43AA8B';
    platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
};

const drawCoins = (ctx: CanvasRenderingContext2D, coins: Coin[]) => {
    ctx.fillStyle = '#F9C74F';
    coins.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
    });
};

const drawObstacles = (ctx: CanvasRenderingContext2D, obstacles: Obstacle[]) => {
    obstacles.forEach(o => {
        if (o.type === ObstacleType.MovingVertical) {
            ctx.fillStyle = '#d96c00';
        } else if (o.type === ObstacleType.MovingHorizontal) {
            ctx.fillStyle = '#90BE6D';
        }
        else {
            ctx.fillStyle = '#F8961E';
        }
        ctx.fillRect(o.x, o.y, o.width, o.height);
    });
};

const Game: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { gameState, player, platforms, score, coins, obstacles, startGame, goToMenu, difficulty } = useGameLogic(CANVAS_WIDTH, CANVAS_HEIGHT);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#0D0C1D';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (gameState === GameState.Playing || gameState === GameState.GameOver || gameState === GameState.LevelComplete) {
            drawPlatforms(ctx, platforms);
            drawCoins(ctx, coins);
            drawObstacles(ctx, obstacles);
            if(player.x) drawPlayer(ctx, player);
        }

    }, [player, platforms, coins, obstacles, gameState]);

    const buttonClasses = "px-8 py-3 bg-transparent border-2 border-[#43AA8B] text-[#43AA8B] font-bold text-lg rounded hover:bg-[#43AA8B] hover:text-white transition-all duration-300 transform hover:scale-105";
    const secondaryButtonClasses = "px-6 py-2 mt-4 bg-transparent border border-gray-600 text-gray-400 font-semibold text-md rounded hover:bg-gray-700 hover:text-white transition-colors duration-200";

    return (
        <div className="relative bg-[#0D0C1D] rounded-lg shadow-2xl overflow-hidden border-2 border-[#43AA8B]/50" style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="bg-[#0D0C1D]"
            />
            
            {gameState === GameState.StartScreen && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D0C1D]/80 backdrop-blur-sm text-center p-4">
                    <h2 className="text-6xl font-light text-gray-200 mb-4 tracking-[0.2em] uppercase">Gravity</h2>
                    <p className="text-xl text-gray-400 mb-10 font-light tracking-wider">Select a difficulty to begin</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => startGame(Difficulty.Easy)} className={buttonClasses}>Easy</button>
                        <button onClick={() => startGame(Difficulty.Medium)} className={buttonClasses}>Medium</button>
                        <button onClick={() => startGame(Difficulty.Hard)} className={buttonClasses}>Hard</button>
                    </div>
                     <div className="text-md text-gray-500 mt-16 font-light">
                        <p>Controls: <kbd className="px-2 py-1 mx-1 text-xs font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded">Click</kbd> or <kbd className="px-2 py-1 mx-1 text-xs font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded">Space</kbd> to flip.</p>
                    </div>
                </div>
            )}

            {gameState === GameState.LevelComplete && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm text-center p-4">
                    <h2 className="text-5xl font-light text-[#43AA8B] mb-2 uppercase tracking-widest">Level Complete</h2>
                    <p className="text-3xl text-white mb-8">Final Score: <span className="font-bold text-[#F9C74F]">{score}</span></p>
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => startGame(difficulty)}
                            className="px-8 py-4 bg-[#43AA8B] text-white font-bold text-xl rounded hover:bg-teal-500 transition-transform transform hover:scale-105"
                        >
                            Play Again
                        </button>
                        <button onClick={goToMenu} className={secondaryButtonClasses}>Main Menu</button>
                    </div>
                </div>
            )}

            {gameState === GameState.GameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm text-center p-4">
                    <h2 className="text-5xl font-light text-[#F94144] mb-2 uppercase tracking-widest">Game Over</h2>
                    <p className="text-3xl text-white mb-8">Final Score: <span className="font-bold text-[#F9C74F]">{score}</span></p>
                     <div className="flex flex-col items-center">
                        <button
                            onClick={() => startGame(difficulty)}
                            className="px-8 py-4 bg-[#F94144] text-white font-bold text-xl rounded hover:bg-red-500 transition-transform transform hover:scale-105"
                        >
                            Try Again
                        </button>
                        <button onClick={goToMenu} className={secondaryButtonClasses}>Main Menu</button>
                    </div>
                </div>
            )}
            
             <div className={`absolute top-4 right-4 bg-black/30 px-4 py-2 rounded text-2xl font-light text-white transition-opacity duration-300 ${gameState === GameState.Playing ? 'opacity-100' : 'opacity-0'}`}>
                Score: <span className="font-semibold text-[#F9C74F]">{score}</span>
            </div>
        </div>
    );
};

export default Game;