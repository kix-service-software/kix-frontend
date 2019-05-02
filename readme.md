<!-- TOC -->autoauto- [1. KIXng Webapplication](#1-kixng-webapplication)auto- [2. Installation & Start](#2-installation--start)auto    - [2.1. Command Line](#21-command-line)auto    - [2.2. debuggen im VSCode](#22-debuggen-im-vscode)auto- [3. Verwendete Third-Party Libraries](#3-verwendete-third-party-libraries)auto- [4. ...](#4-)autoauto<!-- /TOC -->
# 1. KIXng Webapplication
Node Projekt für KIXng Webanwendung.

# 2. Installation & Start
## 2.1. Command Line
```shell
npm install --all
# installation des @kix/core packages in der Entwicklerversion
sh ./install-unstable.sh
gulp
npm start
```
## 2.2. debuggen im VSCode
* Haupordner im VSCode öffnen.
* Integriertes Terminal öffnen

```shell
npm install --all
```

* mit F5 DEBUG starten
    * führt gulp aus
    * startet Webanwendung im DEBUG Modus (NODE_ENV="development")

# 3. Verwendete Third-Party Libraries
* Socket.io (2.1.2) ```/src/static/thirdparty/socket.io.js```
* D3 (4.10.2) ```/src/static/thirdparty/d3-4.10.2```
* ckeditor (4.7.3) ```/src/static/thirdparty/ckeditor-4.7.3```

# 4. ...