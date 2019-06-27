# CCMS
# About
This project is still in development and should not be used. It aims to be a component based CMS, with editable component layouts instead of template files.  

## Technology
Node.js, React.js

## Installing
`yarn install --production`  
Currently only json file databases are supported.

## Running
To run the server run
`yarn run server`  
After installing create the admin account by visiting `http://localhost:8081/c/setup`. After this you can visit admin UI at 
 `http://localhost:8081/c/`

## Developing
To run the server with nodemon
`yarn run server-watch`

Check `./scr/api` for more.

The bundle is split into 2 parts, login, an the app  
To run the app with  
`yarn run dev`  
Check ./src/app for more.

This runs a webpack-dev-server on a free port (e.g. 8082).  
To run the login app with  
`yarn run dev-login`  
Check ./src/app/login for more. 


### Bundling
Run `yarn run build` to build the bundle & login bundle. 

### Tests
Write tests in the same folder as the source file, with an inclusion of ".test.js". 

#### API tests
Most API routes are tested, found in `./src/api/**/*.test.js`.  

#### Component tests
TODO

#### E2E tests
TODO  



# State

## Dones
- Signup, register
- User api / reset pw / invite users
- Pages / Layout / Blocks
- Editor: elements, tree view

# Todo
- Error logging
- Tests: component tests, e2e tests
- Editor: CSS editing
- Databases: SQL (&migrations), MongoDB
- Email providers
- Page templates
- Duplicate items in tree view
- Fix element text rendering & editing
- Fix Drag-n-Drop in tree view
- Uploads server on public pages, not always
- Name