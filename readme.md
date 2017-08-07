<!-- TOC -->

- [1. KIXng Webapplication](#1-kixng-webapplication)
- [2. Installation & Start](#2-installation-start)
    - [2.1. Command Line](#21-command-line)
    - [2.2. debuggen im VSCode](#22-debuggen-im-vscode)
- [3. Projekt-Struktur](#3-projekt-struktur)
    - [3.1. .vscode](#31-vscode)
    - [3.2. src](#32-src)
        - [3.2.1. src/components](#321-srccomponents)
            - [3.2.1.1. src/components/app](#3211-srccomponentsapp)
                - [3.2.1.1.1. browser.json](#32111-browserjson)
        - [3.2.2. src/model](#322-srcmodel)
        - [3.2.3. src/routes](#323-srcroutes)
        - [3.2.4. src/services](#324-srcservices)
        - [3.2.5. src/static](#325-srcstatic)
        - [3.2.6. src/Server.ts](#326-srcserverts)
    - [3.3. tests](#33-tests)
    - [3.4. gitignore](#34-gitignore)
    - [3.5. npmignore](#35-npmignore)
    - [3.6. gitlab-ci.yml](#36-gitlab-ciyml)
    - [3.7. gulpfile.js](#37-gulpfilejs)
    - [3.8. LICENSE](#38-license)
    - [3.9. package.json](#39-packagejson)
    - [3.10. readme.md](#310-readmemd)
    - [3.11. server.config.json](#311-serverconfigjson)
    - [3.12. tslint.json](#312-tslintjson)

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

# 3. Projekt-Struktur

## 3.1. .vscode
Enthält grundlegende EInstellungen VSCode für Tasks, Launch und generelle IDE Settings.

## 3.2. src
Enthält alle Quellen (TypeScript) für die Webanwendung. Themen/Schichten/Komponenten sind durch eine Ordnerstruktur organisiert.

### 3.2.1. src/components
Enthält alle Marko-Komponenten für die Webanwendung. Pro Komponente gibt es ein Verzeichnis.

#### 3.2.1.1. src/components/app
Enthält die Haupt-Marko-Komponente und die browser.json. 

##### 3.2.1.1.1. browser.json
In der Browser.json werden durch die Anwendung automatisiert beim Start alle Abhängigkeiten eingetragen, welche notwendig sind und durch Lasso für den static content gebundlet werden müssen. Der Pluginmanager sucht nach Extensions "kix:markodependencies" und trägt die definierten Abhänigkeiten in die browser.json ein.

### 3.2.2. src/model
Enthält die TypeScript-Klassen für Datenmodelle.

### 3.2.3. src/routes
Enthält die TypeScript-Klassen für das Routing der Webanwendung.

### 3.2.4. src/services
Enthält die Klassen für die Geschäftslogig der Webanwendung.

### 3.2.5. src/static
Enthält den static Content für die Webanwendung, welcher über den Webserver zur Verfügung gestellt wird.

### 3.2.6. src/Server.ts
Hauptklasse für die Webanwendung. Kümmert sich um das bootstrapping des Webservers, sowie die Registrierung aller notwendigen Komponenten, wir Router o.Ä.

## 3.3. tests
Enthält alle Funktionstests (uni-Tests) für die Webanwendung. Diese Test werden auch im CI ausgeführt.

## 3.4. gitignore
Enthält Einträge mit Pfaden oder Dateien, welche nicht im GIT-Repository gepflegt werden.

## 3.5. npmignore
Enthält Einträge mit Pfaden oder Dateien, welche nicht mit in das NPM-Modul "gepublished" werden.

## 3.6. gitlab-ci.yml
Pipeline Config für Gitlab.

## 3.7. gulpfile.js
Gulp Tasks zum Bauen und Testen der Webanwendung. TSLINT, TSC, COPY ...

## 3.8. LICENSE
Lizenz.

## 3.9. package.json
Enthält die grundlegende Beschreibung der Node Anwendung und alle benötigten Abhängigkeiten der Webanwendung.

## 3.10. readme.md
Dokumentation der Webanwendung.

## 3.11. server.config.json
Enthält die grundlegende Konfiguration der Webanwendung.

## 3.12. tslint.json
Enthält die Konfiguration der tslint Regeln zur Prüfung des Quellcodes.