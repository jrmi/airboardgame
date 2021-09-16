# Air board game - the free online tabletop simulator

If you just want to play, go [here](https://airboardgame.net).

* **Choose** a game
* **Share** the link with your friends
* **Play** together

Simple, fast and efficient.

No need to create an account, choose a game from the list ([or create yours](#game-designer-its-also-for-you)) share
the displayed link with your friends by mail or any channel you have in common
and wait for your friends to join you.

## A tabletop simulator ?

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
In just few minutes you can create simple games without any
development skills and play with your friends.

Wants to test a concept? Play a Print & Play game? Use airboardgame without
the need for more hardware.

The only limit is your imagination.

To access this features, login then click on the « create new game » button on home page.

We want Airboardgame to be simple, intuitive and a consistent web application.
Just give a try and if you like it share it and contribute.

You can create a game with simple actions :

* Create items like
  * Round,
  * Rectangle,
  * Dice,
  * Note,
  * Counter,
  * Image that can represent cards, board, token, perks, …
  * …
* Choose board size
* Add available items not on the board but in the "game box" like extension or material for more user.

You can drag'n'drop image from your desktop to the board to use them in Airboardgame.

## Technical details

* Open source web application,
* Made with React and Socket.io,
* Use recoiljs as state management,
* Client to client driven architecture.
  
## Installation instructions

This is the procedure to install Airboargame application from scratch for
development purpose.
You need a recent node version. You can (and should) use [nvm](https://github.com/nvm-sh/nvm)
to initialize your environment.

### Backend

First you need to install and start the server part of the application.
The server code use [ricochetjs](https://github.com/jrmi/ricochetjs). A local
instance is installed and can be started but you can use your own instance.

To proceed, execute:

```sh
cd backend
npm ci
cp site.dist.json site.json
cp .env.dist .env
```

Generate an encryption key:

```sh
npx ricochet --generate-key
Key: <your key displayed here>
```

From here you need to customize `.env` and `site.json` file using this generated
key.
Modify the `RICOCHET_SECRET_KEY` in `.env` file and `key` in `site.json`. Both
must be the same previously generated value.

Default values should be fine for test but remember that data are only kept in
memory so you loose all your changes each time you restart the ricochet server
with this default. See [ricochetjs](https://github.com/jrmi/ricochetjs)
documentation for more options.

Now you can start the ricochet server:

```sh
npm run start
```

And you should also watch for backend code modification to generate
code executed by ricochetjs in another terminal:

```sh
npm run watch
```

you also need an instance of `wire.io` so in another terminal, execute:

```sh
# /!\ Need npm >= v7
PORT=4051 npx wire.io
```

See [wire.io](https://github.com/jrmi/wire.io) documentation for more information
on how to configure it.

### Client

In another terminal, go back to project root and execute:

```sh
cd <project_root>/
npm ci
cp .env.dist .env
```

Edit the `.env` file to fit your needs. Default should be fine if you didn't
modify server configuration.

Then you can start the client:

```sh
npm start
```

Now you should have four terminals:

* the one with ricochetjs server instance. Backend logs can be found here
* one terminal with auto build on change for backend files
* another with `wire.io` server running
* and a last one with React frontend server
