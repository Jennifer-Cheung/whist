# German Whist

Whist is a classic card game which typically entertains 4 players. It is a complicated game which involves planning and strategy. German Whist, the version implemented in this project, is a variation of Whist. It has a simpler ruleset and can entertain 2 players at minimum.

## Game rules

Detailed game rules can be viewed [here](https://en.wikipedia.org/wiki/German_whist). Or you can watch [this video](https://www.youtube.com/watch?v=3lEQDjBrZxI&ab_channel=GatherTogetherGames) for a quicker understanding.

To put it simply, the goal is to play your card that is higher than the opponent's. Each turn has a leading player, who is the winner of the previous turn, and leads the trick. The suit that the leading player plays is called the leading suit of the round, and the next player must "follow suit", which means that they must play a card of the same suit if they have one. Otherwise, they are free to play any.

The player who has the higher card of a round wins the trick, and gains the top card of the deck, which is revealed before the trick, while the other player gains the second card. The winner of the entire game is the player who has won the most tricks.

## How to play
To play this game, you can either access the website here:

Or clone the project and run it locally:
```
npm run dev
```

## Technologies
Here are a list of the technologies used in this project:
- **React** with **Vite**
- **Sass** for styling
- **Storybook** for component testing
- **Vitest** for unit tests
- **TypeScript** for type consistency
