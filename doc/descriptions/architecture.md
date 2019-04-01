### Intruduction
The KIX18 frontend contains a application framework, web server (REST-API) and web application in once. The frontend server (based on [NodeJS](https://nodejs.org)) provides a web server instance ([express](https://expressjs.com/de/)) for http communication. Over the http default route (`http://<fqdn>:<port>/`) the web server delivers the basic web application. The web application itself is a single page application ([SPA](https://en.wikipedia.org/wiki/Single-page_application)). For data requests and responses it uses sockets ([Socket.io](https://socket.io/)) to communicate with the frontend server.

### Layers

As described in the introduction the KIX18 frontend is a bundle of different services and workers.

#### Frontend Server - express

#### Frontend Server - Backend API connection

##### Caching

#### Frontend Server - Socket communication / namespaces

##### Caching