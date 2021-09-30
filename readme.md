# KIX Frontend

## Node Version
* Node 16 is required

## Install 
`npm install --all`

## Build
* `npm run-script build`
* the build artefacts are deployed to `/dist`

## Start
* `npm start`

## Tests

### Cucumber Feature Tests
* `npm test`
  * reports generated to `/allure-results`
* `npm run-script test-cucumber-dev`
  * for Console Output

---

## Basic Configuration

### Server Config

* `/config/server.config.json`
* each value can be overwritten by your environment
```json
{
    "HTTP_PORT": 3000,
    "HTTPS_PORT": 3001,
    "USE_SSL": true,
    "FRONTEND_URL": "",
    "NOTIFICATION_URL": "https://[Frontend-FQDN]/notifications",
    "NOTIFICATION_INTERVAL": 5,
    "NOTIFICATION_CLIENT_ID": "kix-agent-portal",
    "BACKEND_API_URL": "http://[Backend-FQDN]/api/v1",
    "LOG_LEVEL": 3,
    "LOG_FILEDIR": "logs",
    "LOG_TRACE": true,
    "ENABLE_PROFILING": true,
    "BACKEND_API_TOKEN": "...",
    "UPDATE_TRANSLATIONS": true,
    "REDIS_CACHE_PORT": 6379,
    "REDIS_CACHE_HOST": "localhost"
}
```

### SSL

* Certificate `/cert`
* activate `USE_SSL` config

## More Detailed Documentation
* see `/doc/index.html`