# Browser Object Services

Am Beispiel von FAQ.

## Service implementieren

* Service wird als `Singleton` implementiert
* in `@kix/core/browser` neuen Kontext anlegen (`faq`)
* Service muss von `KIXObjectService` ableiten

```javascript
export class FAQService extends KIXObjectService {

    private static INSTANCE: FAQService;

    public static getInstance(): FAQService {
        if (!FAQService.INSTANCE) {
            FAQService.INSTANCE = new FAQService();
        }
        return FAQService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public mainKIXObjectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE;

    public isServiceFor(type: KIXObjectType) {
        return type === KIXObjectType.FAQ_ARTICLE
            || type === KIXObjectType.FAQ_ARTICLE_ATTACHMENT
            || type === KIXObjectType.FAQ_ARTICLE_HISTORY
            || type === KIXObjectType.FAQ_CATEGORY
            || type === KIXObjectType.FAQ_VOTE;
    }

}
```
