# Air board game

Play any board game online in real time with your friends thanks to this [tabletop simulator](https://airboardgame.netlify.app).

If you just want to play, go [here](https://airboardgame.netlify.app).

No need to create an account, each time you visit Airboardgame website,
a new room is automatically created and, as first player,
you can share this room link from the browser address bar with your pals.
Since your friend open the link, you share the same board and you can play together.

Simple, fast and efficient.

## What is it

![In action](./public/screen.png)

Airboardgame is a tabletop simulator to play your favorite board games with your
friends online. It's not a game engine, it's just a tabletop simulator of what you can
do with a real table. You share a common space with other players like if you were is the same room.
If you move something or if you flip a card, other players see
this action and can respond in real time.

Hint: you really should use an audio conference application to speak with other players.

Airboardgame doesn't force you, you make the rules.
Airboardgame is just a game table simulator : what you would do with a real
table you can/must do it with Airboargame.

## Features for players

Flip card items.

![Load and save](./public/flip.gif)

Tap items.

![Load and save](./public/tap.gif)

Flip cards only for you, like hand cards.

![Load and save](./public/flipyou.gif)

See other players cursor on the shared board and how they move in real time.
You can show things, see what they are doing, …

![Load and save](./public/other.gif)

Save and restore game.

![Load and save](./public/loadsave.png)

and more…

## Game designer, it's also for you

Airboardgame is not only designed to play games but also to create them.
In just a few minutes you can create simple games without having any
development skills to play with your friends.
Want to test a concept? Play a Print & Play game? Use airboardgame without the need for more hardware.
The only limit is your imagination.

To access this features, just be the first player and click the "Edit button" to
enable edition features.

We want Airboardgame to be simple, intuitive and consistent web application.
Just give a try and if you like it share it and contribute.

You can create a game with simple actions :

- Create items like
  - Round,
  - Rectangle,
  - Dice,
  - Note,
  - Counter,
  - Image that can represent cards, board, token, perks, …
  - …
- Choose board size
- Add available items not on the board but in the "game box" like extension or material for more user.

## Technical details

- Open source web application
- Made with React and Socket.io,
- Client to client architecture. Very slim and dumb server is needed for
  message passing, clients handle anything else.
  
## Installation for developpers

You need a recent node version. You can use nvm to initialize your environment.
Then, execute

```sh
npm ci # To install dependencies
```

Configure the environement:

Copy the `.env.dist` file without the `.dist` extension and edit it to fit your
needs.

Now you can start the server:

```sh
npm run server
```

Then you can run the client:

```sh
npm start
```
