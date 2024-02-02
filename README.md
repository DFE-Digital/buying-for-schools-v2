# Find a DfE approved framework for your school #

This service replaces the deals for schools guidance.

Find a DfE approved framework for your school helps anyone within schools with a responsibility for buying/procurement to find a framework which best suits their needs.

This help is given via a decision tree navigation which asks simple multiple choice questions, each answer narrowing down the frameworks until either one or a small number of frameworks can be recommended. The recommendations are links to frameworks offered by 3rd parties, as such any purchase/financial transaction takes place on the 3rd party site.

This is a NodeJS/Express based Azure WebApp with a Mongo (Cosmos) database and templates rendered by Nunjucks.

## Deployment

1. The docker image will be built automatically on push to `master`. It can be run manually [uisng the build-and-push-docker-image action](https://github.com/DFE-Digital/buying-for-schools-v2/actions/workflows/build-and-push-docker-image.yml).
2. Inspect the [package repository](https://github.com/DFE-Digital/buying-for-schools-v2/pkgs/container/buying-for-schools-v2) to see if your new docker image has been pushed.
3. Go to the [releases section in Azure DevOps](https://dfe-ssp.visualstudio.com/S107-Find-a-DfE-approved-framework-for-your-school/_release?_a=releases&view=mine&definitionId=19) and select the environment you wish to deploy to. - Either V2 PUBLIC Dev, V2 PUBLIC Test or V2 PUBLIC Prod.
4. Click "create release" and populate the `Docker_Build_Tag` variable with the tag of the docker image you wish to deploy. i.e. If you wish to deploy `2edddb0` fill in `Docker_Build_Tag` as `2edddb0`.


## Install ##

For dev environment...

```sh
    $ npm install
```

For production environment...

```sh
    $ npm install --production --no-optional
```

...this excludes any dependencies required for testing the service or developing the service.


## npm scripts ##

### ` $ npm start ` ###
Start the service in it's normal state
Open [http://localhost:5000](http://localhost:5000) to view it in the browser.

### ` $ npm run start:dev ` ###
Start the service in dev mode, such that the service is restarted each time changes are made, SASS is recompiled etc.

### ` $ npm test ` ###
Run all tests: jhint, mocha and cucumber

### ` $ npm run test:jshint ` ###
Run jshint

### ` $ npm run test:mocha ` ###
Run Mocha unit tests

### ` $ npm run test:bdd ` ###
Run cucumber tests


## Code ##
This project uses NodeJS, Express and Mongo (Azure Cosmos DB).


MONGO_READONLY
DOC_STATUS 4000
PORT

## env variables ##

### ` PORT ` ###

Defines the port for serving the app, defaults: 4000


### ` MONGO_READONLY ` ###

**REQUIRED**

The connection string to use to connect to a mongo database, it should be as per the READONLY connection string shown in the Azure Cosmos DB Connection String section **with** the addition of the database name added after the portnumber.


### ` DOC_STATUS ` ###

Options are ` DRAFT ` or ` LIVE `, defaults to ` LIVE `.

This setting affects which DB record is used in this instance of the app, on Production the value should be ` LIVE ` but on a test env it's useful to display the ` DRAFT ` version, in order to gain sign-off on proposed changes before promoting the record to ` LIVE ` and archiving the previous instance.
