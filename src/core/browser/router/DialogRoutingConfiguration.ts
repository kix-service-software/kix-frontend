/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
