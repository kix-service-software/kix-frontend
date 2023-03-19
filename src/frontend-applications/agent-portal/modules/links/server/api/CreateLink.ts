/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestObject } from '../../../../../../server/model/rest/RequestObject';

export class CreateLink extends RequestObject {

    public constructor(
        sourceObject: string, sourceKey: string,
        targetObject: string, targetKey: string,
        type: string
    ) {
        super();
        this.applyProperty('SourceObject', sourceObject);
        this.applyProperty('SourceKey', sourceKey);
        this.applyProperty('TargetObject', targetObject);
        this.applyProperty('TargetKey', targetKey);
        this.applyProperty('Type', type);
    }

}
