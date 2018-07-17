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

    getCategory(token: string, categoryId: string): Promise<FAQCategory>;

    getCategories(token: string, categoryIds: string[]): Promise<FAQCategory[]>;

    getArticle(token: string, articleId: number): Promise<FAQArticle>;

    getArticles(token: string, articleId: number): Promise<FAQArticle[]>;

    createArticle(token: string, parameter: Array<[string, any]>): Promise<number>;

}
```

### Service implementieren

In `@kix/core/services/impl/api` den Service anlegen.

* Der Service muss von `KIXObjectService` ableiten
* Der Service muss das entsprechende Interface implementieren
* die `isServiceFor()` Methode muss ermitteln ob der Service mit dem gegebenen Typ umgehen kann
* die `RESOURCE_URI` gibt den Hauptpfad der Rest-Resource an 

```javascript
export class FAQService extends KIXObjectService<FAQArticle> implements IFAQService {

    public isServiceFor(type: KIXObjectType): boolean {
        return type === KIXObjectType.FAQ_ARTICLE
            || type === KIXObjectType.FAQ_ARTICLE_ATTACHMENT
            || type === KIXObjectType.FAQ_ARTICLE_HISTORY
            || type === KIXObjectType.FAQ_CATEGORY
            || type === KIXObjectType.FAQ_VOTE;
    }

    protected RESOURCE_URI: string = 'faq';

    public async getCategory(token: string, categoryId: string): Promise<FAQCategory> { }

    public async getCategories(token: string, categoryIds: string[]): Promise<FAQCategory[]> { }

    public async getArticle(token: string, articleId: number): Promise<FAQArticle> { }

    public async getArticles(token: string, articleId: number): Promise<FAQArticle[]> { }

    public async createArticle(token: string, parameter: Array<[string, any]>): Promise<number> { }


}
```