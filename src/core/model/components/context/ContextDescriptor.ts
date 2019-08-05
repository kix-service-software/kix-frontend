/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
        ) => Context
    ) { }

    public isContextFor(kixObjectType: KIXObjectType): boolean {
        return this.kixObjectTypes.some((t) => t === kixObjectType);
    }

}
