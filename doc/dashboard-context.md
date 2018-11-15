# Dashboard integrieren

Beispiel FAQ

## Context implementieren & registrieren

* `FAQContext`
* `FAQContextConfiguration`

Context im `FAQService` registrieren:
```typescript
const faqContextDescriptor = new ContextDescriptor(
            FAQContext.CONTEXT_ID, [KIXObjectType.FAQ_ARTICLE],
            ContextType.MAIN, ContextMode.DASHBOARD,
            false, 'faq', 'faq', FAQContext
        );
        ContextService.getInstance().registerContext(faqContextDescriptor);
```

## Module registrieren & implementieren

* `/src/components/faq/faq-module` (Komponente)

### Marko-Abhängigkeiten regsitrieren

```typescript
public getDependencies(): string[] {
    return [
        'faq/faq-module',
        ...
    ]
}

public getComponentTags(): Array<[string, string]> {
    // Als Tag die ID des Contextes verwenden, da an Hand der Kontext-ID die Komponente ermittelt wird
    return [
        ['faq', 'faq/faq-module'],
        ...
    ]
}
```