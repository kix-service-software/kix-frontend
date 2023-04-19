/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from './IConfiguration';
import { FormFieldOption } from './FormFieldOption';
import { FormFieldValue } from './FormFieldValue';
import { ConfigurationType } from './ConfigurationType';

export class FormFieldConfiguration implements IConfiguration {

    public instanceId: string;

    public parent: FormFieldConfiguration;

    public application: string = 'agent-portal';

    public constructor(
        public id: string,
        public label: string,
        public property: string,
        public inputComponent: string,
        public required: boolean = false,
        public hint?: string,
        public options: FormFieldOption[] = [],
        public defaultValue: FormFieldValue = new FormFieldValue(null),
        public fieldConfigurationIds: string[] = [],
        public children: FormFieldConfiguration[] = [],
        public parentInstanceId: string = null,
        public countDefault: number = null,
        public countMax: number = null,
        public countMin: number = null,
        public maxLength: number = null,
        public regEx: string = null,
        public regExErrorMessage: string = null,
        public empty: boolean = false,
        public asStructure: boolean = false,
        public readonly: boolean = false,
        public placeholder: string = null,
        public existingFieldId: string = null,
        public showLabel: boolean = true,
        public name: string = label,
        public draggableFields: boolean = false,
        public defaultHint: string = hint,
        public type: ConfigurationType = ConfigurationType.FormField,
        public visible: boolean = true,
        public translateLabel: boolean = true,
        public valid: boolean = true,
    ) {
        this.instanceId = existingFieldId ? existingFieldId : null;
    }
}
