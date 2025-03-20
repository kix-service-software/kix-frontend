/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../../../modules/base-components/webapp/core/AbstractComponentState';
import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public field: FormFieldConfiguration = null,
        public formId: string = null,
        public minimized: boolean = false,
        public level: number = 0,
        public hint: string = '',
        public show: boolean = false,
        public canDraggable: boolean = false,
        public draggable: string = 'false',
        public label: string = '',
        public errorMessages: string[] = []
    ) {
        super();
    }

}
