/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { LinkTypeDescription } from '../../model/LinkTypeDescription';


export class CreateLinkDescription<T extends KIXObject = KIXObject> {

    public constructor(
        public linkableObject: T,
        public linkTypeDescription: LinkTypeDescription
    ) { }

}
