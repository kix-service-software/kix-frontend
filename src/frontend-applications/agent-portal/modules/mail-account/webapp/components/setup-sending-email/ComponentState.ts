/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public prepared: boolean = false,
        public isSetup: boolean = false,
        public instanceId: string = 'admin-outbox',
        public title: string = 'Translatable#Communication: Email: Outbox',
        public completed: boolean = false
    ) {
        super();
    }

}