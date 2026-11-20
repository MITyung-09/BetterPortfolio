"use client";

import { useState } from "react";
import FlappyGame from "./FlappyGame";
import DungeonGame from "./DungeonGame";
import Game2048 from "./Game2048";
import MemoryGame from "./MemoryGame";
import MuteToggle from "./MuteToggle";
import ReactionGame from "./ReactionGame";
import RunnerGame from "./RunnerGame";
import SnakeGame from "./SnakeGame";
import TetrisGame from "./TetrisGame";

const games = [
  { id: "flappy", name: "Ember Flap", tagline: "Dodge the pillars", controls: "Space / Tap", how: "Tap, click or press Space to flap. Fly through the gaps and don't touch a pillar.", Component: FlappyGame },
  { id: "snake", name: "Snake", tagline: "Classic", controls: "Arrows / Swipe", how: "Steer with the arrow keys or WASD, or swipe. Eat the orange dots to grow and don't hit a wall or yourself. P or Space pauses.", Component: SnakeGame },
  { id: "game2048", name: "2048", tagline: "Puzzle", controls: "Arrows / Swipe", how: "Slide the tiles with the arrow keys, WASD or a swipe. Equal numbers merge. Reach 2048!", Component: Game2048 },
  { id: "tetris", name: "Tetris", tagline: "Classic", controls: "Arrows / Space", how: "Left and right move, Up rotates, Down speeds up, Space drops. Fill rows to clear them. P pauses. On a phone use the buttons.", Component: TetrisGame },
  { id: "runner", name: "Endless Runner", tagline: "Arcade", controls: "Space / Down", how: "Jump spikes with Space, Up or a tap. Hold Down (or the Duck button) to slip under the flying bats. It gets faster the further you go.", Component: RunnerGame },
  { id: "dungeon", name: "Mini Dungeon", tagline: "Adventure", controls: "Arrows / Swipe", how: "Move with the arrow keys, WASD or a swipe. Walk into enemies to fight them. Red dots heal, gold is points, and > leads deeper. Space waits a turn.", Component: DungeonGame },
  { id: "memory", name: "Memory", tagline: "Match the pairs", controls: "Click / Tap", how: "Flip two cards at a time and match all 8 pairs in as few moves as you can.", Component: MemoryGame },
  { id: "reaction", name: "Reaction test", tagline: "How fast are you?", controls: "Click / Tap", how: "Wait for the box to turn green, then click as fast as you can. Click early and you start over.", Component: ReactionGame },
];

// Game list on the left, a little arcade cabinet on the right.
// Only the selected game is mounted, so the others stop running when you switch.
export default function Arcade() {
  const [selected, setSelected] = useState(games[0].id);
  const game = games.find((g) => g.id === selected) ?? games[0];

  return (
    <div className="arcade">
      <div className="carts" role="group" aria-label="Choose a game">
        {games.map((g, i) => (
          <button key={g.id} type="button" className="cart" aria-pressed={selected === g.id} onClick={() => setSelected(g.id)}>
            <span className="n">0{i + 1}</span>
            <strong>{g.name}</strong>
            <small>{g.tagline}</small>
          </button>
        ))}
      </div>

      <div className="cabinet">
        <div className="cabHead">
          <span className="dots" aria-hidden="true"><i /><i /><i /></span>
          <strong>{game.name}</strong>
          <span className="keys">{game.controls}</span>
          <MuteToggle />
        </div>
        <div className="screen"><game.Component /></div>
        <p className="how">{game.how}</p>
      </div>
    </div>
  );
}
