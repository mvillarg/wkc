# Welcome to World Kart Championship

This is a concept web-app developed for DevAway_ using [Svelte](https://svelte.dev)

It can be accessed directly from [Github preview](https://mvillarg.github.io/wkc/) (note that it usually takes ~10 seconds to load!)

~Miki


## Deploy locally (NodeJS required)

Install the dependencies...

```bash
npm install
```

...then start:

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see the app running.

*Note that you will need to have [Node.js](https://nodejs.org) installed.*


## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).


## Using TypeScript

This template comes with a script to set up a TypeScript development environment, you can run it immediately after cloning the template with:

```bash
node scripts/setupTypeScript.js
```

Or remove the script via:

```bash
rm scripts/setupTypeScript.js
```

## Deploying to the web

### With [Vercel](https://vercel.com)

Install `vercel` if you haven't already:

```bash
npm install -g vercel
```

Then, from within your project folder:

```bash
cd public
vercel deploy --name my-project
```

### With [surge](https://surge.sh/)

Install `surge` if you haven't already:

```bash
npm install -g surge
```

Then, from within your project folder:

```bash
npm run build
surge public my-project.surge.sh
```
