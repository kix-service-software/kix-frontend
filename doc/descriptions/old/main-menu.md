# Hauptmenüeintrag

Beispiel FAQ

## Extension registrieren

* kix:menu:main

`"faq-menu-main": "../../dist/registry-modules/faq/faq-menu.extension"`

## Extension implementieren

```typescript
export class DashboardMainMenuExtension implements IMainMenuExtension {

    public link: string = "/faq";

    public icon: string = "faq";

    public text: string = "FAQ";

    public contextId: string = FAQContext.CONTEXT_ID;

    public contextMode: ContextMode = ContextMode.DASHBOARD;

    public KIXObjectType: KIXObjectType = KIXObjectType.ANY;

}

module.exports = (data, host, options) => {
    return new DashboardMainMenuExtension();
};
```

