# Find a DfE approved framework for your school #

This service replaces the deals for schools guidance.

Find a DfE approved framework for your school helps anyone within schools with a responsibility for buying/procurement to find a framework which best suits their needs.

This help is given via a decision tree navigation which asks simple multiple choice questions, each answer narrowing down the frameworks until either one or a small number of frameworks can be recommended. The recommendations are links to frameworks offered by 3rd parties, as such any purchase/financial transaction takes place on the 3rd party site.

This is a NodeJS based Azure WebApp.

## More documentation ##

- [Decision Tree API](./app/decisionTree)
- [Decision Tree Data structures](./app/data)

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

### ` $ npm run start:testing ` ###
Run the unit tests using Jest, watch all changes to test files and re-run if required whilst outputting coverage reports.

### ` $ npm test ` ###
Run all tests: jhint, jest and cucumber

### ` $ npm run test:jshint ` ###
Run jshint

### ` $ npm run test:jest ` ###
Run Jest unit tests

### ` $ npm run test:bdd ` ###
Run cucumber tests

The following load tests require [artillery](https://artillery.io/docs/getting-started/) to be installed globally on your system.

### ` $ npm run test:load ` ###
Run load tests using Artillery against the Azure URL of the prod env

### ` $ npm run test:loadreport ` ###
Launches a local website to explore the load report data, you must run the load test first!


## Code ##

The project uses JSON data files to populate a set of data which is loaded when the app first loads this is held in memory permanently. This is possible because the number of frameworks we're expected to deal with is ~40 and the number of questions in the decision tree structure is ~30. As the numbers are so low it seems unnescessary to use a database. Not using a database greatly simplifies the deployment of the project.

The service is stateless and the url of each stage conveys all required information to recreate each page.




