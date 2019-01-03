import { ContextMode } from "./ContextMode";
import { ContextType } from "./ContextType";
import { KIXObjectType } from "../../kix";
import { Context } from "./Context";
import { ContextConfiguration } from "./ContextConfiguration";

export class ContextDescriptor {

    public constructor(
        public contextId: string,
        public kixObjectTypes: KIXObjectType[],
        public contextType: ContextType,
        public contextMode: ContextMode,
        public objectSpecific: boolean,
        public componentId: string,
        public urlPaths: string[],
        public contextClass: new (
            descriptor: ContextDescriptor, objectId: string | number, configuration: ContextConfiguration
        ) => Context<ContextConfiguration>
    ) { }

    public isContextFor(kixObjectType: KIXObjectType): boolean {
        return this.kixObjectTypes.some((t) => t === kixObjectType);
    }

}
