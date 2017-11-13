# imNext.online API 

This repository contains the serverside code for the imNext.online project. The imNext.online project is a self-service appointment scheduling system that enables users to schedule appointments directly with their service providers. The api is written in JavaScript with **Node.js** and **MongoDB** as the database; **Mongoose** is used as the ODM.

The client for this project can be found here: [imNext.online Client Repository](https://github.com/aamay001/imnext-client)

# Key Features

## Human Validation System

[src\controllers\human-validation.controller.js](https://github.com/aamay001/imnext-api/blob/master/src/controllers/human-validation.controller.js)

With the use of the **Twilio API** and **Google's reCAPTCHA2**, humans are validated with a two step verfication process. The first step towards human validation is to provide a legitimate mobile phone number and pass the reCAPTCHA test. After submitting a valid mobile phone number, the user will receive a randomized 8 digit validation code that expires in 30 minutes. Once a validation code has been issued, a second validation code is not issued until the first one expires or is used. Validations are required for appointment scheduling and account activation.

## Authentication Service

[src\service\authentication](https://github.com/aamay001/imnext-api/tree/master/src/service/authentication)

In addition to the Human Validation System, the imNext.online API requires authentication for a number of routes. Initial authentication is handled by the Basic HTTP (RFC 7235) authentication scheme. After the initial authentication, a **JSON web token** is issued to the client for subsequent requests to protected endpoints. The **JWT** will expire within seven days unless the user rehydrates four days after the issue date of the **JWT**. Authentication for both **Basic** and **JWT** strategies are handled by the **Passport.js** library; passwords are encrypted using **bcrypt**.

## Appointment Scheduling Algorithm

[src\controllers\appointment.controller.js](https://github.com/aamay001/imnext-api/blob/master/src/controllers/appointment.controller.js)

A custom appointment scheduling algorithm was designed to make user onboarding as quickly as possible. After a user activates her service provider account, a quick survey of their work schedule is used to calculate their availability. These are the question the algorithm needs answered to generate time slots:

1. What days of the week do you work on?
2. How long does each appointment take? (in minutes)
3. What time is the first appointment?
4. What time do you go home?
5. What time do you take your lunch break?
6. How long is your lunch break? (in minutes)

With answers to the questions above, the algorithm generate availability. Additional features will include adding exclusions to block out specific dates or date ranges for things like vacations and holidays.

# Packages and Technologies

+ bcrypt
+ body-parser
+ cors
+ date-fns
+ express
+ jsonwebtoken
+ mongoose
+ mongoose-unique-validator
+ morgan
+ passport
+ passport-http
+ passport-jwt
+ recaptch2
+ twilio
+ chai
+ chai-as-promised
+ chai-http
+ chai-datetime
+ mocha
+ travisci
+ heroku

# Clone & Run

``` git clone https://github.com/aamay001/imnext-api.git ```

``` npm install ```

### Required Environment Variables

Create a **.env** file with the following:
```
NODE_ENV= [dev | prod]
BABEL_ENV= [development | production]

// SIGN UP FOR RECAPTCHA2 with GOOGLE
CAPTCHA_SECRET=
CAPTCHA_SITE_KEY=

// WHATEVER YOU WANT FOR DEV / SOMETHING SECRET FOR PROD
TOKEN_SECRET=

// SIGN UP FOR TWILIO ACCOUNT
TWILIO_ACCOUNT=
TWILIO_NUMBER=
TWILIO_TOKEN=
```

### Windows Users

I've setup the project to use the package **cross-env**. However, depending on what terminal/command line you use, you may have to troubleshoot escape characters.

Here are the commands that worked for me using the command line:
```
"scripts": {
    "test-dev": "cross-env NODE_ENV=test BABEL_ENV=development mocha --require babel-register src/test/*.test.js --exit",
    "test": "NODE_ENV=test mocha --require babel-register src/* --exit",
    "start": "cross-env babel-node src/app.js node",
    "dev": "cross-env nodemon src/app.js --exec babel-node",
    "prettier": "cross-env prettier --single-quote --print-width 80 --trailing-comma all --write 'src/**/*.js'"
  },
  ```
  
 ### Mongo DB
 
 If you don't already have MongoDB installed, install and configure. Then, make sure it's running.
 
 ``` mongod ```
 
 ### Commands
 
 ```
 /// This command is reserved for Production environment.
 npm start 
 
 /// This command is used to run the server while in development environment. (use this to start server)
 npm run dev
 
 /// This command is reserved for Travis CI to run tests.
 npm test
 
 /// This command is used to run tests in development environment.
 npm run test-dev
 
 
 /// This command is used to format all documents with coding style.
 npm run prettier
 ```
