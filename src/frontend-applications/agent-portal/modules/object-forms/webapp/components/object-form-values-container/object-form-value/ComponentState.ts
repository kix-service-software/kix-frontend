/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../../model/IdService';
import { AbstractComponentState } from '../../../../../base-components/webapp/core/AbstractComponentState';
import { ValidationResult } from '../../../../../base-components/webapp/core/ValidationResult';
import { ObjectFormValue } from '../../../../model/FormValues/ObjectFormValue';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public formValue: ObjectFormValue = null,
        public inputTemplate: any = null,
        public valid: boolean = true,
        public validationErrors: ValidationResult[] = [],
        public readonly: boolean = false,
        public required: boolean = false,
        public label: string = '',
        public hint: string = null,
        public visible: boolean = false,
        public enabled: boolean = false,
        public elementId: string = IdService.generateDateBasedId('object-form-value-'),
        public formValues: ObjectFormValue[] = [],
        public isEmpty: boolean = false,
        public configReadOnly: boolean = false,
        public displayNone: boolean = false,
        public prepared: boolean = false
    ) {
        super();
    }

}