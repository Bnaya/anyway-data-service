# Anyway data service stuff


All of the needed cli tools here (aside from node & npm) are installed locally.
Don't install nothing globally. just do the `npm install`

```
npm install
```

And the `scripts` section of the [`package.json`](./package.json) contains things you better look at.

This project contain code mostly intended to be deployed to firebase functions, but the code tries to ne agnostic to that fact, where is not too big effort.  
Ask us for access to the project.

You need node to be installed, by the version in [.nvmrc](./.nvmrc)

The code is mostly typescript. writing plain modern js is also suppose to work.
Unfortunately firebase and python ain't good friends, and also the serverless FW GCP support is unmaintained, but we might eventually add also serverless project so we can deploy python code.

The Database schema is managed by typeorm entity files, and the cli. (`npm run typeorm`)

We use postgres.
See the [.env.template](./.env.template) and save it as `.env`.
Sometimes it will make sense to work on a local server, sometimes you may develop stuff directly against the prod db. ask as for credentials. 

How to run local runners with debug (with vscode autoattach it's 🔥🔥🔥)
```sh
npm run tsnode-debug src/localRunners/wazeAlertsDownloaderImpl.ts
```

## Code Style
There's prettier and eslint in place. please use editor plugins to support that.
Husky will validate it on push.
Every rule is can be changed, just lets talk about it before.

## Workflows/How To:
* I want to create new table/entity
