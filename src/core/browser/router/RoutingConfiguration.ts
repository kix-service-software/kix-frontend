import { ContextMode, KIXObjectType } from "../../model";

export class RoutingConfiguration {

    public constructor(
        public contextId: string,
        public objectType: KIXObjectType,
        public contextMode: ContextMode,
        public objectIdProperty: string,
        public history: boolean = false,
        public externalLink?: boolean,
        public replaceObjectId?: string | number
    ) { }

}
