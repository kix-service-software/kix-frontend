/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Attachment } from '../../../../../../model/kix/Attachment';
import { AbstractComponentState } from '../../../../../base-components/webapp/core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public value: any = null,
        public attachments: Array<Attachment | File> = [],
        public options: Array<[string, any]> = [],
        public prepared: boolean = false,
        public readonly: boolean = null
    ) {
        super();
    }

}