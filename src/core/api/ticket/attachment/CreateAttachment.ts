import { RequestObject } from '../../RequestObject';

export class CreateAttachment extends RequestObject {


    public constructor(content: string, contentType: string, fileName: string) {
        super();

        this.applyProperty('Content', content);
        this.applyProperty('ContentType', contentType);
        this.applyProperty('Filename', fileName);
    }

}
