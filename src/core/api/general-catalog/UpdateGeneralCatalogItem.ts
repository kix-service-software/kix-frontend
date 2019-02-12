import { RequestObject } from '../RequestObject';

export class UpdateGeneralCatalogItem extends RequestObject {

    public constructor(
        generalCatalogClass: string = null, name: string = null,
        validId: number = null, comment: string = null
    ) {
        super();
        this.applyProperty('Class', generalCatalogClass);
        this.applyProperty('Name', name);
        this.applyProperty('ValidID', validId);
        this.applyProperty('Comment', comment);
    }

}
