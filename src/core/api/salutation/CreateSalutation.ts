import { RequestObject } from '../RequestObject';

export class CreateSalutation extends RequestObject {

    public constructor(
        name: string, text: string,
        contentType: string = "text/plain; charset=utf-8", comment: string = null, validId: number = null
    ) {
        super();
        this.applyProperty("Name", name);
        this.applyProperty("Text", text);
        this.applyProperty("ContentType", contentType);
        this.applyProperty("Comment", comment);
        this.applyProperty("ValidID", validId);
    }

}
