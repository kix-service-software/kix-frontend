import { RequestObject } from '../RequestObject';

export class UpdateSignature extends RequestObject {

    public constructor(
        name: string = null,
        text: string = null,
        contentType: string = null,
        comment: string = null,
        validId: number = null
    ) {
        super();
        this.applyProperty("Name", name);
        this.applyProperty("Text", text);
        this.applyProperty("ContentType", contentType);
        this.applyProperty("Comment", comment);
        this.applyProperty("ValidID", validId);
    }

}
