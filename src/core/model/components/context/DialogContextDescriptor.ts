import { ContextMode } from "./ContextMode";
import { ContextType } from "./ContextType";
import { KIXObjectType } from "../../kix";
import { Context } from "./Context";
import { ContextConfiguration } from "./ContextConfiguration";
import { ContextDescriptor } from "./ContextDescriptor";

export class DialogContextDescriptor extends ContextDescriptor {

    public constructor(
        public contextId: string,
        public kixObjectTypes: KIXObjectType[],
        public contextType: ContextType,
        public contextMode: ContextMode,
        public objectSpecific: boolean,
        public componentId: string,
        public urlPaths: string[],
        public contextClass: new (
            descriptor: DialogContextDescriptor, objectId: string | number, configuration: ContextConfiguration
        ) => Context<ContextConfiguration>,
        public formId: string = ''
    ) {
        super(
            contextId, kixObjectTypes, contextType, contextMode,
            objectSpecific, componentId, urlPaths, contextClass
        );
    }

}
