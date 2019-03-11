import { RequestObject } from '../RequestObject';

export class UpdateStandardAttachment extends RequestObject {

    public constructor(
        name: string = null,
        content: string = null,
        contentType: string = null,
        fileName: string = null,
        comment: string = null,
        validId: number = null
    ) {
        super();
        this.applyProperty('Name', name);
        this.applyProperty('Content', content);
        this.applyProperty('ContenType', contentType);
        this.applyProperty('Filename', fileName);
        this.applyProperty('Comment', comment);
        this.applyProperty('ValidID', validId);
    }

}
