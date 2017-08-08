<!-- TOC -->

- [1. KIXng Webapplication](#1-kixng-webapplication)
- [2. Installation & Start](#2-installation-start)
    - [2.1. Command Line](#21-command-line)
    - [2.2. debuggen im VSCode](#22-debuggen-im-vscode)
- [3. Server Konfiguration](#3-server-konfiguration)
- [4. Services](#4-services)
    - [4.1. TODO: Logging Service](#41-todo-logging-service)
    - [4.2. TODO: Authentication Service](#42-todo-authentication-service)
    - [4.3. TODO: PluginService](#43-todo-pluginservice)
        - [4.3.1. Beschreibung](#431-beschreibung)
        - [4.3.2. Interface](#432-interface)
    - [4.4. TODO: Backend/API HTTP-Service](#44-todo-backendapi-http-service)
    - [4.5. TODO: Object Services](#45-todo-object-services)
- [5. Extension-Points](#5-extension-points)
    - [5.1. Marko-Dependencies](#51-marko-dependencies)
        - [5.1.1. TODO: Interface](#511-todo-interface)
- [6. Projekt-Struktur](#6-projekt-struktur)
    - [6.1. .vscode](#61-vscode)
    - [6.2. src](#62-src)
        - [6.2.1. src/components](#621-srccomponents)
            - [6.2.1.1. src/components/app](#6211-srccomponentsapp)
                - [6.2.1.1.1. browser.json](#62111-browserjson)
        - [6.2.2. src/model](#622-srcmodel)
        - [6.2.3. src/routes](#623-srcroutes)
        - [6.2.4. src/services](#624-srcservices)
        - [6.2.5. src/static](#625-srcstatic)
        - [6.2.6. src/Server.ts](#626-srcserverts)
    - [6.3. tests](#63-tests)
    - [6.4. gitignore](#64-gitignore)
    - [6.5. npmignore](#65-npmignore)
    - [6.6. gitlab-ci.yml](#66-gitlab-ciyml)
    - [6.7. gulpfile.js](#67-gulpfilejs)
    - [6.8. LICENSE](#68-license)
    - [6.9. package.json](#69-packagejson)
    - [6.10. readme.md](#610-readmemd)
    - [6.11. server.config.json](#611-serverconfigjson)
    - [6.12. tslint.json](#612-tslintjson)

<!-- /TOC -->
# 1. KIXng Webapplication
Node Projekt für KIXng Webanwendung.

# 2. Installation & Start
## 2.1. Command Line
```
npm install --all
gulp
npm start
```
## 2.2. debuggen im VSCode
* Haupordner im VSCode öffnen.
* Integriertes Terminal öffnen

```
npm install --all
```

* mit F5 DEBUG starten
    * führt gulp aus
    * startet Webanwendung im DEBUG Modus (NODE_ENV="development")

# 3. Server Konfiguration
Die Konfiguration des Servers befindet sich in dem File server.config.json.
```json
{
    "SERVER_PORT": 3000,
    "PLUGIN_FOLDERS": [
        "node_modules/@kix"
    ],
    "BACKEND_API_HOST": "http://localhost:3123"
}
```

# 4. Services

## 4.1. TODO: Logging Service
* speichern von Logmeldungen
* Loglevel: ERROR, WARNING, INFO, DEBUG
* Loglevel per Umgebungsvariable definierbar
* Logeintrag:
    * DATUM / Uhrzeit
    * LOGLEVEL
    * KOMPONENTE
    * FUNCTION / CALLER
    * MESSAGE 

Beispiel-Logeintrag: 
```
20170708-0926|WARNING|DASHBOARD|LOAD_WIDGET|Extension not found.
20170708-0925|ERROR|TICKET|GET_ALL|Backend not reachable.
20170408-1425|INFO|LOGIN|USER_LOGIN|Login successful.
20170408-1425|DEBUG|TICKET_OVERVIEW|LOAD_ARTICLES|12 Articles retrieved from backend.
```


## 4.2. TODO: Authentication Service
* JWT (Json Web Token) https://jwt.io/
* Validierung des Tokens auf Gültigkeit
* Token Cache?
* Redirect zum Login
* Login Request gegen Backend / API 

## 4.3. TODO: PluginService

### 4.3.1. Beschreibung
Der Service scant konfigurierte Verzeichnisse nach Extension-Points. Die zu durchsuchenden Verzeichnisse werden in der server.config.json konfiguriert. In den Verzeichnissen wird rekursiv nach package.json Files gesucht und in diesen Files wird auf einen Abschnitt Extensions geprüft. Alle darin enthaltenen Definitionen werden entsprechend geladen und im Pluginmanager gehalten. Die Erweiterungen können dann an Hand einer ID vom Plugin Manager abgerufen werden.

Beispiel für eine Extension-Verwendung (package.json eines externen Node-Modules:):
```json
{
    "extensions": {
        "extension-id-1": {
            "forms": "dist/register-extension-1"
        },
        "extension-id-2": {
            "forms-marko": "dist/register-extension-2"
        }
    }
}
```

### 4.3.2. Interface

```javascript
loadPlugins(): Promise<any>;
```

## 4.4. TODO: Backend/API HTTP-Service
* Kappselung HTTP-Request/Response
* HTTP-Status-Codes
* HTTP-Methoden (GET, POST, PUT, UPDATE, DELETE)
* Fehlerhandling

## 4.5. TODO: Object Services
* Kappselung von Geschäftslogik für Businessobjekte (Ticket, Queue, CI, ...)
* Hauptaufgaben:
    * Daten laden
    * Daten ändern
    * Daten erstellen/hinzufügen
    * Daten löschen 

# 5. Extension-Points
Folgender Abschnitt dient der Beschreibung der Verwendung der Erweiterungspunkte für die Anwendung.

## 5.1. Marko-Dependencies
An diesem Erweiterungspunkt können externe Module ihre Marko-Templates bzw. statischen Content registrieren, welcher durch Lasso mit in die Anwendung eingebunden werden soll.
Die Erweiterung muss ein Array mit Pfaden liefern, welche sich ab Modulverzeichnis aufbauen. 

Zum Beispiel:
```json
[
    "@kix/ticket/components/ticket-table",
    "@kix/ticket/components/ticket-core-data"
]
```

### 5.1.1. TODO: Interface
* ID: "kix-marko-dependencies"

```javascript
interface IMarkoDependency {
    getDependencyPaths(): string[];
}
```

# 6. Projekt-Struktur

## 6.1. .vscode
Enthält grundlegende EInstellungen VSCode für Tasks, Launch und generelle IDE Settings.

## 6.2. src
Enthält alle Quellen (TypeScript) für die Webanwendung. Themen/Schichten/Komponenten sind durch eine Ordnerstruktur organisiert.

### 6.2.1. src/components
Enthält alle Marko-Komponenten für die Webanwendung. Pro Komponente gibt es ein Verzeichnis.

#### 6.2.1.1. src/components/app
Enthält die Haupt-Marko-Komponente und die browser.json. 

##### 6.2.1.1.1. browser.json
In der Browser.json werden durch die Anwendung automatisiert beim Start alle Abhängigkeiten eingetragen, welche notwendig sind und durch Lasso für den static content gebundlet werden müssen. Der Pluginmanager sucht nach Extensions "kix:markodependencies" und trägt die definierten Abhänigkeiten in die browser.json ein.

### 6.2.2. src/model
Enthält die TypeScript-Klassen für Datenmodelle.

### 6.2.3. src/routes
Enthält die TypeScript-Klassen für das Routing der Webanwendung.

### 6.2.4. src/services
Enthält die Klassen für die Geschäftslogig der Webanwendung.

### 6.2.5. src/static
Enthält den static Content für die Webanwendung, welcher über den Webserver zur Verfügung gestellt wird.

### 6.2.6. src/Server.ts
Hauptklasse für die Webanwendung. Kümmert sich um das bootstrapping des Webservers, sowie die Registrierung aller notwendigen Komponenten, wir Router o.Ä.

## 6.3. tests
Enthält alle Funktionstests (uni-Tests) für die Webanwendung. Diese Test werden auch im CI ausgeführt.

## 6.4. gitignore
Enthält Einträge mit Pfaden oder Dateien, welche nicht im GIT-Repository gepflegt werden.

## 6.5. npmignore
Enthält Einträge mit Pfaden oder Dateien, welche nicht mit in das NPM-Modul "gepublished" werden.

## 6.6. gitlab-ci.yml
Pipeline Config für Gitlab.

## 6.7. gulpfile.js
Gulp Tasks zum Bauen und Testen der Webanwendung. TSLINT, TSC, COPY ...

## 6.8. LICENSE
Lizenz.

## 6.9. package.json
Enthält die grundlegende Beschreibung der Node Anwendung und alle benötigten Abhängigkeiten der Webanwendung.

## 6.10. readme.md
Dokumentation der Webanwendung.

## 6.11. server.config.json
Enthält die grundlegende Konfiguration der Webanwendung.

## 6.12. tslint.json
Enthält die Konfiguration der tslint Regeln zur Prüfung des Quellcodes.