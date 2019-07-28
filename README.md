# Anyway data service stuff

## env vars you need to setup yourself (Until we find a better integration way):

`GOOGLE_APPLICATION_CREDENTIALS`

The account need to have permission to deploy the functions and to the KMS keychain

example value in bash_profile:
```
export GOOGLE_APPLICATION_CREDENTIALS=${HOME}/.gcloud/anyway-hasadna-deployer.json
```

The other env params are saved into .env file (that is checked in to git)
While the secret values there are encrypted using google KMS
The consumer side of the env params need to know how to decrypt them. 


### Another paragraph
All of the needed cli tools here (aside from node & npm) are installed locally.
Don't install nothing globally. just do the `npm install`

```
npm install
```

And the `scripts` section of the [`package.json`](./package.json) contains things you better look at.

This project contain code mostly intended to be deployed to firebase functions, but the code tries to ne agnostic to that fact, where is not too big effort.  
Ask us for access to the project.

You need node to be installed, by the version in [.nvmrc](./.nvmrc)

The code is mostly typescript and python. writing plain modern js is also suppose to work.
To deploy the python code we use the serverless cli tool, that is available under `npm run sls` command.
To python version is 3.7.1 (GCP version).
it's recommended to use pyenv, and create a virtualenv with the name `anyway-data-service` as in the .python-version file.
If you've installed any new python lib, don't forget to run `pip freeze > requirements.txt`

The `waze_data` Database schema is managed by typeorm entity files, and the cli. (`npm run typeorm`)


How to run local runners with debug (with vscode autoattach it's 🔥🔥🔥)
```sh
npm run tsnode-debug src/localRunners/wazeAlertsDownloaderImpl.ts
```

## Deployment

The python functions are deployed via serverless framework cli
```npm run sls deploy```

The node via firebase
```npm run firebase```

## Code Style
There's prettier and eslint in place. please use editor plugins to support that.
Husky will validate it on push.
Every rule is can be changed, just lets talk about it before.

## Workflows/How To:
* I want to create new table/entity

### KMS example
```sh
 echo -n "s3cr3t" | gcloud kms encrypt \
    --location=europe-west2 \
    --keyring=anyway-hasadna-data-service \
    --key=forenvvars \
    --ciphertext-file=- \
    --plaintext-file=- \
    | base64
```

```sh
 echo -n "CiQAHsGlncBSmIeMfu5GjjmFiXsHT3QM7kKgp3Q7Z84ZwnEouMcSLwDp1Mcql6VvjUCtjsXnrFpDpBxdbI4x3ydJuK2rSyTYWXJPhNgPCiRbuh1cMpBK" \
 | base64 --decode \
 | gcloud kms decrypt \
    --location=europe-west2 \
    --keyring=anyway-hasadna-data-service \
    --key=forenvvars \
    --ciphertext-file=- \
    --plaintext-file=-
```
```sh
gcloud kms keys add-iam-policy-binding forenvvars \
    --location europe-west2 \
    --keyring anyway-hasadna-data-service \
    --member "serviceAccount:anyway-hasadna@appspot.gserviceaccount.com" \
    --role roles/cloudkms.cryptoKeyDecrypter
```

```sh
gcloud kms keys add-iam-policy-binding forenvvars \
    --location europe-west2 \
    --keyring anyway-hasadna-data-service \
    --member "serviceAccount:bnaya-functions-deployer@anyway-hasadna.iam.gserviceaccount.com" \
    --ro
```

### TODOs
  - Write A better readme
  - Setup python kms decrypt
  - Add python linter and formatter
  - add simple way to have local dev env vars
