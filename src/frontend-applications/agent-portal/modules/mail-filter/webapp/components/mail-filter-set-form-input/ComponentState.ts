/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponentState } from '../../../../../modules/base-components/webapp/core/FormInputComponentState';
import { MailFilterSetManager } from '../../core';

export class ComponentState extends FormInputComponentState {

    public constructor(
        public setManager: MailFilterSetManager = null,
        public translations: Map<string, string> = new Map(),
    ) {
        super();
    }

}
