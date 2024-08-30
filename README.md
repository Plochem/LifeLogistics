## Installation

```
npm install && npm run prepare-husky
```

## Adding environment variables

Create a new file, `.env.local`, in the root directory

```
- .husky
- .vscode
- public
- src
- .env.example
- .env.local // file should be added here
```

Copy over everything (excluding the lines with the comment) from `.env.example` to `.env.local`.

Then finish filling in the values of the rest of the environment variables

**If you make changes to `.env.local`, you MUST restart the server**

## Running the server

```
npm run dev
```

## Stopping the server

```
Ctrl-C
```

### Additional things to know

- if you get linter errors that you for sure know should be right, try these steps
  - Press `Ctrl-Shift-P` or Help->Show All Commands
  - type `restart typescript server` and hit enter
  - type `restart eslint server` and hit enter
  - if restarting doesn't work, then you're probably wrong... 🤷‍♂️
- some vscode extensions you (really) should install
  - [prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
