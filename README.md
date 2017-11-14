# Twilio Programmable Chat on React

This is an implementation of [Twilio Programmable Chat](https://www.twilio.com/docs/api/chat) using [React](https://facebook.github.io/react/).

## Setting up the app

To run this application you will need four configuration parameters, available from your [Twilio console](https://www.twilio.com/console).

| Config Value  | Description |
| :-------------  |:------------- |
Service Instance SID | Like a database for your Programmable Chat data - [generate one in the console here](https://www.twilio.com/console/ip-messaging/services)
Account SID | Your primary Twilio account identifier - find this [in the console here](https://www.twilio.com/console/ip-messaging/getting-started).
API Key | Used to authenticate - [generate one here](https://www.twilio.com/console/ip-messaging/dev-tools/api-keys).
API Secret | Used to authenticate - [just like the above, you'll get one here](https://www.twilio.com/console/ip-messaging/dev-tools/api-keys).

## A Note on API Keys

When you generate an API key pair at the URLs above, your API Secret will only be shown once - make sure to save this in a secure location, or possibly your `~/.bash_profile`.

## Setting Up The Node.js Application

Create a configuration file for your application:

```bash
cp .env.example .env
```

Edit `.env` with the four configuration parameters we gathered from above.

Next, we need to install our dependencies from npm:

```bash
npm install
cd client/
npm install
cd ..
```

Now you are ready! Run the application with

```bash
npm start
```

Your application should start up at http://localhost:3000.
