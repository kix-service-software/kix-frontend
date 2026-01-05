/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ILabelProvider } from '../../../../../modules/base-components/webapp/core/ILabelProvider';
import { Organisation } from '../../../model/Organisation';
import { Contact } from '../../../model/Contact';
import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public labelProvider: ILabelProvider<Organisation | Contact> = null,
        public property: string = null,
        public object: Organisation | Contact = null,
        public propertyText: string = null,
        public displayText: string = null,
        public title: string = null
    ) {
        super();
    }

}
