<!-- TOC -->

- [1. KIXng Webapplication](#1-kixng-webapplication)
- [2. Installation & Start](#2-installation-start)
    - [2.1. Command Line](#21-command-line)
    - [2.2. debuggen im VSCode](#22-debuggen-im-vscode)
- [3. Dependency Injection](#3-dependency-injection)
    - [3.1. Verwendung](#31-verwendung)
    - [3.2. MOCK-HTTP-Server](#32-mock-http-server)
- [4. Server Konfiguration](#4-server-konfiguration)
- [5. Services](#5-services)
    - [5.1. TODO: Logging Service](#51-todo-logging-service)
    - [5.2. Authentication Service](#52-authentication-service)
        - [5.2.1. Beschreibung](#521-beschreibung)
        - [5.2.2. Verwendung](#522-verwendung)
        - [5.2.3. Interface](#523-interface)
    - [5.3. PluginService](#53-pluginservice)
        - [5.3.1. Beschreibung](#531-beschreibung)
        - [5.3.2. Interface](#532-interface)
    - [5.4. HTTP-Service](#54-http-service)
        - [5.4.1. Beschreibung](#541-beschreibung)
        - [5.4.2. Verwendung](#542-verwendung)
        - [5.4.3. Interface](#543-interface)
        - [5.4.4. Fehlerbehandlung](#544-fehlerbehandlung)
            - [5.4.4.1. HttpError](#5441-httperror)
        - [5.4.5. Beispiel](#545-beispiel)
    - [5.5. TODO: Object Services](#55-todo-object-services)
- [6. Extension-Points](#6-extension-points)
    - [6.1. Static Content](#61-static-content)
        - [6.1.1. Extension ID](#611-extension-id)
        - [6.1.2. Interface](#612-interface)
        - [6.1.3. Beispiel](#613-beispiel)
- [7. Projekt-Struktur](#7-projekt-struktur)
    - [7.1. .vscode](#71-vscode)
    - [7.2. src](#72-src)
        - [7.2.1. src/components](#721-srccomponents)
            - [7.2.1.1. src/components/app](#7211-srccomponentsapp)
                - [7.2.1.1.1. browser.json](#72111-browserjson)
        - [7.2.2. src/model](#722-srcmodel)
        - [7.2.3. src/routes](#723-srcroutes)
        - [7.2.4. src/services](#724-srcservices)
        - [7.2.5. src/static](#725-srcstatic)
        - [7.2.6. src/Server.ts](#726-srcserverts)
    - [7.3. tests](#73-tests)
    - [7.4. gitignore](#74-gitignore)
    - [7.5. npmignore](#75-npmignore)
    - [7.6. gitlab-ci.yml](#76-gitlab-ciyml)
    - [7.7. gulpfile.js](#77-gulpfilejs)
    - [7.8. LICENSE](#78-license)
    - [7.9. package.json](#79-packagejson)
    - [7.10. readme.md](#710-readmemd)
    - [7.11. server.config.json](#711-serverconfigjson)
    - [7.12. tslint.json](#712-tslintjson)

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

# 3. Dependency Injection
Für die Instanzierung von Services wird das KOnzept der Dependency Injection (DI) verwendet. Dazu gibt es eine "Container"-Implementierung, welche sich um die Bindung der Instanzen kümmert.
## 3.1. Verwendung
Eine neue Instanz im Container registrieren:
```javascript
this.container.bind<IPluginService>("IPluginService").to(PluginService);
```
Eine Instanz am Container abfragen:
```javascript
const applicationRouter = container.get<IApplicationRouter>("IApplicationRouter");
```
Eine Instanz per @inject im Konstruktor:
```javascript
public constructor( @inject("IHttpService") httpService: IHttpService) {
...
}
```


## 3.2. MOCK-HTTP-Server
Wird die Anwendung im "development" Modus gestartet, so wird ein Mock-HTTP-Server gestartet. Dieser kann verwendet werden solange noch kein Backend zur Verfügung steht.
Dieser Server wird auf Port 3123 gestartet.
**ACHTUNG:** Die Mockimplementierung wird wieder entfernt!

# 4. Server Konfiguration
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

# 5. Services

## 5.1. TODO: Logging Service
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


## 5.2. Authentication Service
### 5.2.1. Beschreibung
Dieser Service hat die Aufgabe zu prüfen ob Requests eine gültigen Authorization Header mit Token haben. Sollten Requests ungültig sein, so wird zum Login weitergeleitet.
Weiterhin bietet der Service die Funktion sich als Nutzer einzuloggen.

### 5.2.2. Verwendung
Zum Absichern von Routen:
```javascript
const auhtenticationService = ...;

this.router.get("/", this.authenticationService.isAuthenticated.bind(this), this.getRoot.bind(this));
```

### 5.2.3. Interface
```javascript
interface IAuthenticationService {

    isAuthenticated(req: Request, res: Response, next: () => void): void;

    login(user: string, password: string, type: UserType): Promise<string>;

}
```

## 5.3. PluginService

### 5.3.1. Beschreibung
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

### 5.3.2. Interface

```javascript
interface IPluginService {

    getExtensions<T>(extensionId: string): Promise<T[]>;

}
```

## 5.4. HTTP-Service
### 5.4.1. Beschreibung
Dieser Service kappselt die HTTP-FUnktionalität und kümmert sich um das senden von Requests gegen das Backend, sowie dem Empfangen und Verarbeiten von Responses und Fehlern.

### 5.4.2. Verwendung

| Methode | Beschreibung                                              | Result                             |
| ------- | --------------------------------------------------------- | ---------------------------------- |
| GET     | Abfrage von einzelen Objekten oder Listen                 | Object (Json) oder Liste (Array)   |
| POST    | Erstellt ein **neues** Objekt.                            | Die Id des neu erstellten Objektes |
| PUT     | **Ersetzt** ein vorhandenes Objekt                        | Die Id des ersetzten Objektes      |
| PATCH   | Aktualisiert ein vorhandens Objekt (einzelne Properties). | Die Id des aktualisierten Objektes |
| DELETE  | Löscht eine Resource                                      | Nichts.                            |

### 5.4.3. Interface
```javascript
interface IHttpService {

    get(resource: string, queryParameters?: any): Promise<any>;

    post(resource: string, content: any): Promise<string>;

    put(resource: string, content: any): Promise<string>;

    patch(resource: string, content: any): Promise<string>;

    delete(resource: string): Promise<any>;
}
```
### 5.4.4. Fehlerbehandlung
Sollte der Response einen Fehler Repräsentieren (HTTP-Status-Code), so liefert der Service ein Fehlerobjekt vom Typ ```HttpError```.

#### 5.4.4.1. HttpError
```javascript
class HttpError extends KIXError {

    public status: number;

    ...
}
```

### 5.4.5. Beispiel
```javascript
const httpService: IHttpService = new HttpService();

const ticket = await httpService.get('ticket/12345')
    .catch((err: HttpError) => {
        console.error(err.status + ': ' + err.error);
    });
```

## 5.5. TODO: Object Services
* Kappselung von Geschäftslogik für Businessobjekte (Ticket, Queue, CI, ...)
* Hauptaufgaben:
    * Daten laden
    * Daten ändern
    * Daten erstellen/hinzufügen
    * Daten löschen 

# 6. Extension-Points
Folgender Abschnitt dient der Beschreibung der Verwendung der Erweiterungspunkte für die Anwendung.

## 6.1. Static Content
An diesem Erweiterungspunkt können externe Module *"static content"*-Verzeichnisse registrieren. Diese Verzeichnisse werden dann in Express als static eingebunden. An der Extension muss ein Name für den *"static content"* und der Pfad zum Verzeichnis definiert werden.

### 6.1.1. Extension ID
```kix:static:content```

### 6.1.1. Interface
```javascript
interface IStaticContentExtension {

    getName(): string;

    getPath(): string;

}
```

### 6.1.2. Beispiel
```javascript
class TicketStaticContentExtension implements IStaticContentExtension {

    public getName(): string {
        return "ticket-static";
    }

    public getPath(): string {
        return "@kix/ticket/static";
    }

}
```
Der statische Content für das "Ticketmodul" kann dann vom Client via ```http://<FQDN>/ticket-static/...``` abgerufen werden.

## 6.2. Marko-Dependencies
An diesem Erweiterungspunkt können externe Module ihre Marko-Templates bzw. statischen Content registrieren, welcher durch Lasso mit in die Anwendung eingebunden werden soll.
Die Erweiterung muss ein Array mit Pfaden liefern, welche sich ab Modulverzeichnis aufbauen. 

### Extension ID
```kix:marko:dependencies```

### 6.1.2. Interface

```javascript
interface IMarkoDependency {
    getDependencyPaths(): string[];
}
```

### 6.1.3. Beispiel
```javascript
class TicketMarcoDependencyExtension implements IMarkoDependencyExtension {

    getDependencies(): string[] {
        return [
            "@kix/ticket/components/ticket-table",
            "@kix/ticket/components/ticket-core-data"
        ];
    }
}
```

# 7. Projekt-Struktur

## 7.1. .vscode
Enthält grundlegende EInstellungen VSCode für Tasks, Launch und generelle IDE Settings.

## 7.2. src
Enthält alle Quellen (TypeScript) für die Webanwendung. Themen/Schichten/Komponenten sind durch eine Ordnerstruktur organisiert.

### 7.2.1. src/components
Enthält alle Marko-Komponenten für die Webanwendung. Pro Komponente gibt es ein Verzeichnis.

#### 7.2.1.1. src/components/app
Enthält die Haupt-Marko-Komponente und die browser.json. 

##### 7.2.1.1.1. browser.json
In der Browser.json werden durch die Anwendung automatisiert beim Start alle Abhängigkeiten eingetragen, welche notwendig sind und durch Lasso für den static content gebundlet werden müssen. Der Pluginmanager sucht nach Extensions "kix:markodependencies" und trägt die definierten Abhänigkeiten in die browser.json ein.

### 7.2.2. src/model
Enthält die TypeScript-Klassen für Datenmodelle.

### 7.2.3. src/routes
Enthält die TypeScript-Klassen für das Routing der Webanwendung.

### 7.2.4. src/services
Enthält die Klassen für die Geschäftslogig der Webanwendung.

### 7.2.5. src/static
Enthält den static Content für die Webanwendung, welcher über den Webserver zur Verfügung gestellt wird.

### 7.2.6. src/Server.ts
Hauptklasse für die Webanwendung. Kümmert sich um das bootstrapping des Webservers, sowie die Registrierung aller notwendigen Komponenten, wir Router o.Ä.

## 7.3. tests
Enthält alle Funktionstests (uni-Tests) für die Webanwendung. Diese Test werden auch im CI ausgeführt.

## 7.4. gitignore
Enthält Einträge mit Pfaden oder Dateien, welche nicht im GIT-Repository gepflegt werden.

## 7.5. npmignore
Enthält Einträge mit Pfaden oder Dateien, welche nicht mit in das NPM-Modul "gepublished" werden.

## 7.6. gitlab-ci.yml
Pipeline Config für Gitlab.

## 7.7. gulpfile.js
Gulp Tasks zum Bauen und Testen der Webanwendung. TSLINT, TSC, COPY ...

## 7.8. LICENSE
Lizenz.

## 7.9. package.json
Enthält die grundlegende Beschreibung der Node Anwendung und alle benötigten Abhängigkeiten der Webanwendung.

## 7.10. readme.md
Dokumentation der Webanwendung.

## 7.11. server.config.json
Enthält die grundlegende Konfiguration der Webanwendung.

## 7.12. tslint.json
Enthält die Konfiguration der tslint Regeln zur Prüfung des Quellcodes.