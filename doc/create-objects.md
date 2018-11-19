# KIX Objekte anlegen

Am Beispiel FAQ Artikel

## Erstellkontext einbinden

### Kontext implementieren und Formularkonfiguration zur Verfügung stellen
- "kix-module"-Extension in der package.json registrieren

```javascript
"kix:module": {
    ...,
    "new-faq-article-dialog-context": "../../dist/registry-modules/faq/new-faq-article-dialog-context.extension",
}
```
- Context und ContextConfiguration implementieren (`@kix/core/browser/faq/context`)
    - NewFAQArticleDialogContext
    - NewFAQArticleDialogContextConfiguration

- Context registrieren (`ContextService`) in der Modul-Komponente (`faq-module-component`)

```javascript
const newFAQArticleContext = new ContextDescriptor(
    NewFAQArticleDialogContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE], ContextType.DIALOG, ContextMode.CREATE,
    false, 'new-faq-article-dialog', 'faqarticle/new', NewFAQArticleDialogContext
);
ContextService.getInstance().registerContext(newFAQArticleContext);
```

### Erstelldialog implementieren & registrieren
- Komponente implementieren `src/components/faq/dialogs/new-faq-article-dialog` und in die jeweilige `kix-module.extension.ts` eintragen

- in der Module-Komponente (`faq-module-component`) registrieren
```javascript
DialogService.getInstance().registerDialog(new ConfiguredDialogWidget(
    'new-faq-article-dialog',
    new WidgetConfiguration(
        'new-faq-article-dialog', 'Neue FAQ', [], {}, false, false, WidgetSize.BOTH, 'kix-icon-query'
    ),
    KIXObjectType.FAQ_ARTICLE,
    ContextMode.CREATE
));
```