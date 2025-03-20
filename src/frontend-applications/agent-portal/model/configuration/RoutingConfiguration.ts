/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../kix/KIXObjectType';
import { ContextMode } from '../ContextMode';
import { ContextType } from '../ContextType';

export class RoutingConfiguration {

    public contextType: ContextType = ContextType.MAIN;

    public constructor(
        public contextId?: string,
        public objectType?: KIXObjectType | string,
        public contextMode?: ContextMode,
        public objectIdProperty?: string,
        public history: boolean = false,
        public externalLink?: boolean,
        public replaceObjectId?: string | number,
        public resetContext: boolean = true,
        public params: Array<[string, any]> = null,
        public additionalInformation: Array<[string, any]> = [],
        public url?: string
    ) { }

}
