/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldOption } from "../";
import { FormFieldValue } from "../events";
import { IdService } from "../../../../browser";
import { IConfiguration, ConfigurationType } from "../../../configuration";

export class FormFieldConfiguration implements IConfiguration {

    public instanceId: string;

    public parent: FormFieldConfiguration;

    public constructor(
        public id: string,
        public label: string,
        public property: string,
        public inputComponent: string,
        public required: boolean = false,
        public hint?: string,
        public options: FormFieldOption[] = [],
        public defaultValue: FormFieldValue = new FormFieldValue(null),
        public fieldConfigurations: string[] = [],
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
        public type: ConfigurationType = ConfigurationType.FormField,
        public name: string = label,
    ) {
        this.instanceId = existingFieldId ? existingFieldId : IdService.generateDateBasedId(this.property);
    }
}
