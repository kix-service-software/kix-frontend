import { RequestObject } from '../RequestObject';

export class CreateGeneralCatalogItem extends RequestObject {

    public constructor(
        generalCatalogClass: string, name: string,
        validId: number = null, comment: string = null
    ) {
        super();
        this.applyProperty('Class', generalCatalogClass);
        this.applyProperty('Name', name);
        this.applyProperty('ValidID', validId);
        this.applyProperty('Comment', comment);
    }

}
