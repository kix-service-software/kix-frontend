# KIX18 FE Entwicklung

## Wichtige Konfigurationsfiles für das Projekt

### .vscode/tasks.json
Diese Config enthält die wichtigsten Task, welche zum Bauen und Ausführen der Anwendung in der Entwicklungsumgebung VSCode relevant sind.

### .vscode/launch.json
Diese Config enthält die wichtigsten Konfigurationen, welche zum Start des FE Servers notwendig sind. Das betrifft die Anwendung, den Prebuild der Webapp und die UnitTests.

### .vscode/kix.module-templates.json
Diese Config ist Grundlage für die Extension ["Module Templates"](https://marketplace.visualstudio.com/items?itemName=asbjornh.vscode-module-templates) und definiert die wichtigstens Templates, die man in der FE Entwicklung benötigt.

Die Templates können über das Kontextmenü auf einem entsprechenden Verzeichnis verwendet werden.

### .vscode/kix.code-snippets
Diese Config enthält Code Snippets die man sich per Code Completion in den Code einfügen kann.

## Entwicklungsprozess für das FE (AP, SSP)

>***Voraussetzung: Projekt ist korrekt angelegt, konfiguriert und die BE Instanz ist verfügbar!***

### Scenario 1: Arbeitsbeginn

Zu Arbeitsbeginn sollte man mit der Launch Config `KIX - Start Server` beginnen.

Diese Config führt den prelaunch Task "Start Server" aus. Dieser widerum ist Abhängig von anderen Tasks, wie z.B. das Bereinigen vom dist Verzeichnis, sowie dem Löschen des Lasso Caches. Als letzter Task wird dann der Gulp Prozess für den Bau gestartet. Dieser bekommt explizit eine Umgebungsvariable `COMPILE_CODE` gesetzt, damit alles neu nach dist compiliert wird. Die Umgebungsvariable wird nur ausgewertet wenn `NODE_ENV=development` ist. Im produktiven Betrieb (CI Pipelines) wird immer Code compiliert.

Sind die prelaunch Tasks fertig wird der Server gestartet. Da der Lasso Cache gelöscht ist, wird die Anwendung beim Start neu gebaut.

Ist der Server gestartet kann man den Typescript compiler mit Watch-Option starten. D.h. ändert man was an den Sourcen (*.ts), dann wird dies direkt nach dist compiliert.

Den Compiler startet man wie folgt:
* `Strg+Shift+B`
* Auswahl: `KIX - tsc compiler`

Ist dieser Schritt erledigt, kann man mit den anderen Szenarien starten.

### Scenario 2: Änderung an der Webapplication (AP, SSP)

Änderungen betreffen hier die Komponenten, sowie die generelle Businesslogic (webapp/core).
Hat man etwas geändert (in src), so müssen die Änderungen nach dist. Für die *.ts Files läuft der Watcher, welcher automatisch das das nach JS ins dist compiliert. Für den Rest (Styling, Templates, JSON Files) gibt es einen Task der das gezielt macht.

Den Task startet man wie folgt:
* `Strg+Shift+B`
* Auswahl: `KIX - Prebuild Agent Portal` oder `KIX - Prebuild SSP`

Der Task ruft als erstes den Gulp Task auf, aber diesmal ohne `COMPILE_CODE`. D.h. es werden nur die grundlegenden Buildschritte ausgeführt, wie eben das Kopieren der Daten nach dist.
Als zweites leert der Task den Lasso Cache und startet danach den prebuild der entsprechenden Webapplikation.

Wenn der Task durchgelaufen ist kann man im Browser die Seite neu laden und man hat den aktuellen Stand.

### Scenario 3: Änderungen am FE Server

Hat man Änderungen am FE Server gemacht (Namespace, Services, UI Module, Extensions, ...), so muss der Code compiliert werden und die Instanz neu gestartet werden. Das Compilieren übernimmt auch hier der Watcher.

Jetzt kann man die aktuell laufende Server Instanz beenden und mit die Launch-Config `KIX Restart Server` verwenden. Hier wird ebenfalls nochmal `gulp` als prelaunch Task ausgeführt um ggf. neue Files nach dist zu kopieren. Danach wird der FE Server wieder normal gestartet. Das Bauen der Anwendung sollte nicht stattfinden, da es ja den Lasso Cache noch gibt und damit sollte der Neustart relativ schnell erfolgen.

### Scenario 4: Ich habe etwas gelöscht, aber es ist weiterhin im dist

Hier gibt es zwei Optionen:
* Scenario 1
* Dinge von Hand aus dist löschen