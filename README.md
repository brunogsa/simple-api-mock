A simple API mock using express.js, for faster UI development.

Features:
- Has a simple DB kept in memory, and sync it to `db.json`, so you can reload your app without losing your state
- Hot reload
- Automatically logs info about requests and response
- Can live watch the DB content
- Customize `index.js` via express to your needs

How to use:
```
$ npm install
$ npm start  // Starts on localhost:3333, has hot-reload on index.js and db.json

$ npm run lint
$ npm run watch:db  // Live print of the DB content
```
