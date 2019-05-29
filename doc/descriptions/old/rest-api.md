# KIX REST API

Hier wird erläutert wie die KIX-REST-API an das Frontend angebunden wird (***Beispiel FAQ***).

## Datenmodel anlegen

### Objekt-Datenmodell
In `@kix/core/model` Verzeichnis für Kontext anlegen (`faq`).
Aktuell benötigte Klassen implementieren.

* Die Klassen müssen von `KIXObject` ableiten und einen Standardkonstruktor implementieren. In dem Konstruktor sollte ein vorhandenes Objekt übergeben werden können, auf Basis dessen das neue Objekt erstellt wird. 
* Weiterhin ist es wichtig die **objektspezifische ID** auf die `ObjectId` von `KIXObject` zu mappen, da diese Property von generalisierten Methoden im Frontend verwendet wird.
* Es muss der `KIXObjectType` definiert werden.
* Weitere Ergänzung objektspezifischer Eigenschaften an Hand der Dokumentation der entsprechenden REST-API

*Beispiel FAQArticle (unvollständig):*
```javascript
export class FAQArticle extends KIXObject<FAQArticle> {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE;

    // Object Properties (REST DOKU)

    public ID: number;

    public constructor(faqArticle: FAQArticle) {
        super();
        if (faqArticle) {
            this.ID = faqArticle.ID;
            this.ObjectId = faqArticle.ID;
        }

    }

    public equals(faqArticle: FAQArticle): boolean {
        return faqArticle.ID === this.ID;
    }
}
```

### REST-API Datenmodel

Für die Requests und Responses der REST-API muss ein spezifisches Modell definiert werden.

Verwendung der REST-API Dokumentation: http://wiki.intra.cape-it.de/mediawiki/index.php/KIX_2018_REST-API#FAQ.

In `@kix/core/api` Verzeichnis für Resource anlegen (`faq`).

*Beispiel FAQCategory Response Object:*
```javascript
export class FAQCategoryResponse {

    public FAQCategory: FAQCategory;

}
```

## API Service implementieren

Verwendung der REST-API Dokumentation: http://wiki.intra.cape-it.de/mediawiki/index.php/KIX_2018_REST-API#FAQ.

### Interface deklarieren
In `@kix/core/services/api` das Interface für den Service anlegen. Es wird nur das implementiert, was aktuell auch im Frontend benötigt wird. Nicht benötigte Operationen können weggelassen und bei Bedarf später nachgezogen werden.

```javascript
export interface IFAQService extends IService {

    createArticle(token: string, parameter: Array<[string, any]>): Promise<number>;

}
```

### Service implementieren

In `@kix/core/services/impl/api` den Service anlegen.

* Der Service muss von `KIXObjectService` ableiten
* Der Service muss das entsprechende Interface implementieren
* der Service muss an der Registry registriert werden
* die `isServiceFor()` Methode muss ermitteln ob der Service mit dem gegebenen Typ umgehen kann
* die `RESOURCE_URI` gibt den Hauptpfad der Rest-Resource an 

```javascript
export class FAQService extends KIXObjectService implements IFAQService {

    public constructor() {
        super();
        ServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(type: KIXObjectType): boolean {
        return type === KIXObjectType.FAQ_ARTICLE
            || type === KIXObjectType.FAQ_ARTICLE_ATTACHMENT
            || type === KIXObjectType.FAQ_ARTICLE_HISTORY
            || type === KIXObjectType.FAQ_CATEGORY
            || type === KIXObjectType.FAQ_VOTE;
    }

    protected RESOURCE_URI: string = 'faq';

    public async loadObjects(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<KIXObject[]> {
        let objects = [];

        switch (objectType) {
            case KIXObjectType.FAQ_ARTICLE:
                objects = await this.getArticles(token, objectIds);
                break;
            case KIXObjectType.FAQ_CATEGORY:
                objects = await this.getCategories(token, objectIds);
                break;
            default:
        }

        return objects;
    }
    
    public async getArticles(token: string, categoryIds: Array<number | string>): Promise<FAQCategory[]> {
        const uri = this.buildUri(this.RESOURCE_URI, 'articles', categoryIds.join(','));
        const response = await this.getObjectByUri<FAQArticlesResponse | FAQArticleResponse>(token, uri);
        let result = [];
        if (categoryIds.length === 1) {
            result = [(response as FAQArticleResponse).FAQArticle];
        } else {
            result = (response as FAQArticlesResponse).FAQArticle;
        }
        return result;
    }

    public async getCategories(token: string, categoryIds: Array<number | string>): Promise<FAQCategory[]> {
        const uri = this.buildUri(this.RESOURCE_URI, 'categories', categoryIds.join(','));
        const response = await this.getObjectByUri<FAQCategoriesResponse | FAQCategoryResponse>(token, uri);
        let result = [];
        if (categoryIds.length === 1) {
            result = [(response as FAQCategoryResponse).FAQCategory];
        } else {
            result = (response as FAQCategoriesResponse).FAQCategory;
        }
        return result;
    }
}
```
### Service registrieren

Der Service muss mit seinem Interface als Identifier registriert in `CoreServiceRegistry` werden.

