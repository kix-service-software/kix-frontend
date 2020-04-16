# KIX Frontend

## Node Version
* Node 8 is required
* npm 6.4.1 is required

## Build
* `npm run-script build`
* for the build `gulp` is required
* the build artefacts are deployed to `/dist`

## Start
* `npm start`

## Tests

### Cucumber Feature Tests
* `npm run-script test-cucumber`
  * reports generated to `/allure-results`
* `npm run-script test-cucumber-dev`
  * Console Output

### Unit Tests
* `npm run-script test`
  * reports generated to `/allure-results`
* `npm run-script test-dev`
  * Console Output

---

## Basic Configuration

### Server Config

* `/config/server.config.json`
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
    "USE_REDIS_CACHE": true,
    "REDIS_CACHE_PORT": 6379,
    "REDIS_CACHE_HOST": "localhost",
    "USE_IN_MEMORY_CACHE": false
}
```

### SSL

* Certificate `/cert`
* activate `USE_SSL` config

## More Detailed Documentation
* see `/doc/index.html`
* generate the doc: `npm run-script build-doc`
  * `raml2html` is required