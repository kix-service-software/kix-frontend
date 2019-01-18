import { RequestObject } from '../RequestObject';

export class CreateStandardAttachment extends RequestObject {

    public constructor(
        name: string,
        content: string,
        contentType: string,
        fileName: string,
        comment: string = null,
        validId: number = null
    ) {
        super();
        this.applyProperty("Name", name);
        this.applyProperty("Content", content);
        this.applyProperty("ContenType", contentType);
        this.applyProperty("Filename", fileName);
        this.applyProperty("Comment", comment);
        this.applyProperty("ValidID", validId);
    }

}
