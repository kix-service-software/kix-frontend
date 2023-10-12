/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { ObjectFormValueMapper } from '../../ObjectFormValueMapper';
import { ObjectFormValue } from '../ObjectFormValue';

export class DynamicFieldTextAreaFormValue extends ObjectFormValue<string> {

    public isEmpty: boolean = false;

    public constructor(
        public property: string,
        protected object: DynamicFieldValue,
        public objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
        public dfName: string
    ) {
        super(property, object, objectValueMapper, parent);
        this.inputComponentId = 'textarea-form-input';
    }

    public async initFormValue(): Promise<void> {
        const dynamicField = await KIXObjectService.loadDynamicField(this.dfName);
        const config = dynamicField?.Config;

        const regexList = config?.RegExList || [];
        this.regExList = regexList.map((ri) => {
            return { regEx: ri.Value, errorMessage: ri.ErrorMessage };
        });

        this.value = this.object[this.property];
        this.setValueByDefault(config);

        await super.initFormValue();
    }

    private setValueByDefault(config: any): void {
        const isDefaultValueDefined = config?.DefaultValue !== ''
            && config?.DefaultValue !== null
            && typeof config?.DefaultValue !== 'undefined';

        let defaultValue = null;
        if (isDefaultValueDefined) {
            defaultValue = config?.DefaultValue;
        }

        if (
            !this.value
            && defaultValue !== null
            && !this.isEmpty
        ) {
            this.value = defaultValue;
        }
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        this.isEmpty = field?.empty || false;
        await super.initFormValueByField(field);
    }
}