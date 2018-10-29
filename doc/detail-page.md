# Detailseite

Am Beispiel FAQ-Artikel.

# Detail-Context implementieren & registrieren

In `@kix/core/browser/faq/context` Klasse `FAQDetailContext` anlegen. Die Klasse muss von `Context` ableiten.

```javascript
export class FAQDetailsContext extends Context<FAQDetailsContextConfiguration> {

    public static CONTEXT_ID = 'faq-details';

    // ...
}
```
Ggf. "getDisplayText"-Methode von abstrakter Klasse "Context" überschreiben

## DetailsContextConfiguration implementieren

Die Konfiguration bietet den Inhalt des Kontextes an. Die Konfiguration wird als JSON gespeichert und der Kontext muss Informationen aus der Konfiguration lesen/interpretieren.

```javascript
export class FAQDetailsContextConfiguration extends ContextConfiguration {

    public constructor(
        public contextId: string,
        public explorer: string[],
        public sidebars: string[],
        public sidebarWidgets: ConfiguredWidget[],
        public explorerWidgets: ConfiguredWidget[],
        public lanes: string[],
        public laneTabs: string[],
        public laneWidgets: ConfiguredWidget[],
        public laneTabWidgets: ConfiguredWidget[]
    ) {
        super(contextId, sidebars, explorer, sidebarWidgets, explorerWidgets, []);
    }

}
```

## DetailContext registrieren

Der Context muss im entsprechenden Service registriert werden (`FAQService`).
```javascript
const faqDetailsContextDescriptor = new ContextDescriptor(
            FAQDetailsContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE],
            ContextType.MAIN, ContextMode.DETAILS,
            true, 'faq-details', 'faqarticle', FAQDetailsContext
        );
        ContextService.getInstance().registerContext(faqDetailsContextDescriptor);
```

# Detail Modul registrieren & implementieren

## Extension registrieren

Extension für `kix:module` registrieren:

`"faq-details-module": "../../dist/registry-modules/faq/faq-details-module.extension"`

## Extension implementieren

```javascript
export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return FAQDetailsContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        // Content Widgets
        const ticketDetailsWidget = new ConfiguredWidget("faq-details-widget", new WidgetConfiguration(
            "faq-details-widget", "FAQ Details", [], null,
            false, true, WidgetSize.BOTH, null, false
        ));


        return new FAQDetailsContextConfiguration(
            this.getModuleId(), [], [], [], [], [], [], [], []
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
```

## Detail Komponente anlegen

Unter `src/components/faq/` Komponente `faq-details` anlegen und in den FAQ-Marko-Abhängigkeiten eintragen.