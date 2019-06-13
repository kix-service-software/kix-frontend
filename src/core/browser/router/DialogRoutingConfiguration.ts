import { ContextMode, KIXObjectType, ObjectIcon, ContextType } from "../../model";
import { RoutingConfiguration } from "./RoutingConfiguration";

export class DialogRoutingConfiguration extends RoutingConfiguration {

    public contextType: ContextType = ContextType.DIALOG;

    public constructor(
        public contextId: string,
        public objectType: KIXObjectType,
        public contextMode: ContextMode,
        public objectIdProperty: string,
        public objectId?: string | number,
        public resetContext?: boolean,
        public title?: string,
        public singleTab?: boolean,
        public formId?: string,
        public icon?: string | ObjectIcon,
        public resetForm: boolean = resetContext
    ) {
        super(contextId, objectType, contextMode, objectIdProperty);
    }

}
