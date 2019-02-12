import { RequestObject } from "../RequestObject";

export class CreateFAQArticleAttachment extends RequestObject {

    public constructor(parameter: Array<[string, any]>) {
        super();
        parameter.forEach((p) => this.applyProperty(p[0], p[1]));
    }

}
