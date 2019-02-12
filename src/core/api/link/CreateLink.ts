import { RequestObject } from '../RequestObject';

export class CreateLink extends RequestObject {

    public constructor(
        sourceObject: string, sourceKey: string,
        targetObject: string, targetKey: string,
        type: string
    ) {
        super();
        this.applyProperty("SourceObject", sourceObject);
        this.applyProperty("SourceKey", sourceKey);
        this.applyProperty("TargetObject", targetObject);
        this.applyProperty("TargetKey", targetKey);
        this.applyProperty("Type", type);
    }

}
