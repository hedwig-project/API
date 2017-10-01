# cloud

<!-- Start: Badges section -->
![MIT License][license-badge]
<!-- End: Badges section -->

Cloud server responsible for authentication and authorization, persisting and retrieving collected data and establishing a real-time communication between applications and homes.

## Requirements
  - [Node][node]
  - [npm][npm]
  - [Redis][redis] (or just use the `docker-compose` configuration available)

## What's inside

  - [socket.io][socketio] for real-time communication between apps and home controllers
  - [Express][express] to build the server and REST API
  - [Mongoose][mongoose] as a MongoDB ORM
  - [JWT][jwt] and [Passport][passport] for authentication
  - [ESLint][eslint] for linting
  - [Nodemon][nodemon] for development

## Setup

Clone the repository and install the dependencies using `npm install`. Set up your environment variables based on the `.env.sample` file.

## Run it

Use `npm start` to run the development server.

## Production

We recommend using a process manager such as [pm2][pm2], for which we have an available `ecosystem.config.js` file to store production configuration.

## License

MIT

<!-- Start: URL section -->
[node]: https://nodejs.org
[npm]: https://www.npmjs.com/
[redis]: http://redis.io/
[express]: expressjs.com
[socketio]: https://socket.io/
[mongoose]: mongoosejs.com
[passport]: http://passportjs.org/
[jwt]: https://jwt.io/
[nodemon]: https://eslint.org
[pm2]: pm2.keymetrics.io
[license-badge]: https://img.shields.io/github/license/hedwig-project/API.svg
<!-- End: URL section -->
