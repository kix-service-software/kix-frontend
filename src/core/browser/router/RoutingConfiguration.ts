import { ContextMode, KIXObjectType, ContextType } from "../../model";

export class RoutingConfiguration {

    public contextType: ContextType = ContextType.MAIN;

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
