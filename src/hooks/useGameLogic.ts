import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, type Player, type Platform, type Coin, Difficulty, type Obstacle, ObstacleType } from '../types';
import { levelChunks } from '../levels';

const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 40;
const GRAVITY_STRENGTH = 0.4;
const FLIP_VELOCITY = -10;
const COIN_RADIUS = 10;
const PLATFORM_HEIGHT = 20;

const difficultySettings = {
    [Difficulty.Easy]:   { speed: 3.5 },
    [Difficulty.Medium]: { speed: 5 },
    [Difficulty.Hard]:   { speed: 6.5 },
};

export const useGameLogic = (canvasWidth: number, canvasHeight: number) => {
    const [gameState, setGameState] = useState<GameState>(GameState.StartScreen);
    const [player, setPlayer] = useState<Player>({} as Player);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [coins, setCoins] = useState<Coin[]>([]);
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [score, setScore] = useState<number>(0);
    const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Medium);

    const gameLoopRef = useRef<number | null>(null);
    const levelStateRef = useRef({
      chunkIndex: 0,
      isFiniteLevelComplete: false,
    });
    
    const resetGame = useCallback((selectedDifficulty: Difficulty = Difficulty.Medium) => {
        setDifficulty(selectedDifficulty);
        setPlayer({
            x: 100,
            y: canvasHeight / 2,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            velocityY: 0,
            gravity: GRAVITY_STRENGTH,
            visualRotation: 0,
            targetRotation: 0,
        });

        const initialPlatforms: Platform[] = [
            { x: -50, y: canvasHeight - PLATFORM_HEIGHT, width: canvasWidth + 100, height: PLATFORM_HEIGHT },
            { x: -50, y: 0, width: canvasWidth + 100, height: PLATFORM_HEIGHT },
        ];
        setPlatforms(initialPlatforms);
        setCoins([]);
        setObstacles([]);
        setScore(0);
        levelStateRef.current = {
          chunkIndex: 0,
          isFiniteLevelComplete: false,
        }
    }, [canvasHeight, canvasWidth]);
    
    useEffect(() => {
        resetGame(Difficulty.Medium);
    }, [resetGame]);

    const flipGravity = useCallback(() => {
        if (gameState !== GameState.Playing) return;
        setPlayer(p => ({
            ...p,
            gravity: -p.gravity,
            velocityY: p.gravity > 0 ? FLIP_VELOCITY : -FLIP_VELOCITY,
            targetRotation: p.targetRotation + Math.PI,
        }));
    }, [gameState]);

    const startGame = useCallback((selectedDifficulty?: Difficulty) => {
        resetGame(selectedDifficulty ?? difficulty);
        setGameState(GameState.Playing);
    }, [resetGame, difficulty]);

    const goToMenu = useCallback(() => {
        setGameState(GameState.StartScreen);
    }, []);

    const gameLoop = useCallback(() => {
        if (gameState !== GameState.Playing) return;

        const settings = difficultySettings[difficulty];
        const nextPlayer = { ...player };
        const updatedPlatforms = platforms.map(p => ({ ...p, x: p.x - settings.speed })).filter(p => p.x + p.width > 0);
        const updatedCoins = coins.map(c => ({...c, x: c.x - settings.speed}));
        const updatedObstacles = obstacles.map(o => ({...o, x: o.x - settings.speed})).filter(o => o.x + o.width > 0);

        updatedObstacles.forEach(o => {
            if (o.type === ObstacleType.MovingVertical) {
                o.y += o.speed! * o.direction!;
                if (o.y <= o.minY! || o.y + o.height >= o.maxY!) {
                    o.direction! *= -1;
                }
            } else if (o.type === ObstacleType.MovingHorizontal) {
                o.minX! -= settings.speed;
                o.maxX! -= settings.speed;
                
                o.x += o.speed! * o.direction!;

                if (o.x <= o.minX! || o.x + o.width >= o.maxX!) {
                    o.direction! *= -1;
                }
            }
        });

        const chunksForDifficulty = levelChunks[difficulty];
        const lastPlatform = updatedPlatforms[updatedPlatforms.length - 1];
        
        if (levelStateRef.current.chunkIndex < chunksForDifficulty.length && lastPlatform && lastPlatform.x + lastPlatform.width < canvasWidth + 200) {
            const chunk = chunksForDifficulty[levelStateRef.current.chunkIndex];
            levelStateRef.current.chunkIndex++;

            let currentX = lastPlatform.x + lastPlatform.width;

            chunk.forEach(platformDef => {
                currentX += platformDef.gap;
                const newPlatformY = platformDef.y ?? (Math.random() > 0.5 ? 0 : canvasHeight - PLATFORM_HEIGHT);
                
                const newPlatform = {
                    x: currentX,
                    y: newPlatformY,
                    width: platformDef.width,
                    height: PLATFORM_HEIGHT,
                };
                updatedPlatforms.push(newPlatform);

                const numCoins = Math.floor(platformDef.gap / 80);
                for (let i = 1; i <= numCoins; i++) {
                    const coinX = currentX - platformDef.gap + (i * (platformDef.gap / (numCoins + 1)));
                    const safeZoneTop = PLATFORM_HEIGHT + COIN_RADIUS * 4;
                    const safeZoneBottom = canvasHeight - PLATFORM_HEIGHT - COIN_RADIUS * 4;
                    const coinY = Math.random() * (safeZoneBottom - safeZoneTop) + safeZoneTop;
                    updatedCoins.push({ x: coinX, y: coinY, radius: COIN_RADIUS });
                }

                if (platformDef.obstacles) {
                    platformDef.obstacles.forEach(obsDef => {
                        const obstacleY = newPlatform.y === 0 
                            ? newPlatform.y + PLATFORM_HEIGHT 
                            : newPlatform.y - obsDef.height;

                        const newObstacle: Obstacle = {
                            x: currentX + obsDef.offsetX,
                            y: obstacleY,
                            width: obsDef.width,
                            height: obsDef.height,
                            type: obsDef.type,
                        };

                        if (obsDef.type === ObstacleType.MovingVertical) {
                           newObstacle.speed = obsDef.speed;
                           newObstacle.direction = 1;
                           newObstacle.minY = newPlatform.y + PLATFORM_HEIGHT;
                           newObstacle.maxY = canvasHeight - PLATFORM_HEIGHT;
                        } else if (obsDef.type === ObstacleType.MovingHorizontal) {
                           newObstacle.speed = obsDef.speed;
                           newObstacle.direction = 1;
                           newObstacle.minX = currentX;
                           newObstacle.maxX = currentX + newPlatform.width - newObstacle.width;
                        }

                        updatedObstacles.push(newObstacle);
                    });
                }
                currentX += platformDef.width;
            });
        } else if (levelStateRef.current.chunkIndex >= chunksForDifficulty.length && !levelStateRef.current.isFiniteLevelComplete) {
            levelStateRef.current.isFiniteLevelComplete = true;
        }

        const rotationDiff = nextPlayer.targetRotation - nextPlayer.visualRotation;
        if (Math.abs(rotationDiff) > 0.01) {
            nextPlayer.visualRotation += rotationDiff * 0.2;
        } else {
            nextPlayer.visualRotation = nextPlayer.targetRotation;
        }

        nextPlayer.velocityY += nextPlayer.gravity;
        nextPlayer.y += nextPlayer.velocityY;
        
        for (const p of updatedPlatforms) {
            if (nextPlayer.x < p.x + p.width && nextPlayer.x + nextPlayer.width > p.x) {
                if (nextPlayer.velocityY > 0 && nextPlayer.y + nextPlayer.height >= p.y && nextPlayer.y + nextPlayer.height <= p.y + p.height) {
                    nextPlayer.y = p.y - nextPlayer.height;
                    nextPlayer.velocityY = 0;
                    break;
                }
                if (nextPlayer.velocityY < 0 && nextPlayer.y <= p.y + p.height && nextPlayer.y >= p.y) {
                    nextPlayer.y = p.y + p.height;
                    nextPlayer.velocityY = 0;
                    break;
                }
            }
        }
        
        let isGameOver = false;
        if (nextPlayer.y + nextPlayer.height < 0 || nextPlayer.y > canvasHeight) {
            isGameOver = true;
        }

        for (const obstacle of updatedObstacles) {
            if (nextPlayer.x < obstacle.x + obstacle.width &&
                nextPlayer.x + nextPlayer.width > obstacle.x &&
                nextPlayer.y < obstacle.y + obstacle.height &&
                nextPlayer.y + nextPlayer.height > obstacle.y) {
                isGameOver = true;
                break;
            }
        }

        let collectedCoins = 0;
        const remainingCoins = updatedCoins.filter(coin => {
             const dist = Math.sqrt((nextPlayer.x + nextPlayer.width / 2 - coin.x) ** 2 + (nextPlayer.y + nextPlayer.height / 2 - coin.y) ** 2);
             if (dist < nextPlayer.width / 2 + coin.radius) {
                 collectedCoins++;
                 return false;
             }
             return coin.x + coin.radius > 0;
        });
        if (collectedCoins > 0) {
            setScore(s => s + collectedCoins);
        }
        
        if (levelStateRef.current.isFiniteLevelComplete && updatedPlatforms.filter(p => p.x > nextPlayer.x).length === 0) {
            setGameState(GameState.LevelComplete);
            return;
        }

        if (isGameOver) {
            setGameState(GameState.GameOver);
        } else {
            setPlayer(nextPlayer);
            setPlatforms(updatedPlatforms);
            setCoins(remainingCoins);
            setObstacles(updatedObstacles);
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
    
    }, [gameState, player, platforms, coins, obstacles, difficulty, canvasWidth, canvasHeight]);
    
    useEffect(() => {
        if (gameState === GameState.Playing) {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameState, gameLoop]);

    useEffect(() => {
        const handleInteraction = () => {
            if (gameState === GameState.Playing) {
                flipGravity();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                handleInteraction();
            }
        };

        const canvasElement = document.querySelector('canvas');
        canvasElement?.addEventListener('mousedown', handleInteraction);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            canvasElement?.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [gameState, flipGravity, startGame]);

    return { gameState, player, platforms, score, coins, obstacles, startGame, goToMenu, difficulty };
};