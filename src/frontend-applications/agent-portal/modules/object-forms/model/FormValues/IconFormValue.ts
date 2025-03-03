/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { ObjectFormValueMapper } from '../ObjectFormValueMapper';
import { ObjectFormValue } from './ObjectFormValue';

export class IconFormValue extends ObjectFormValue<ObjectIcon | string> {

    public libraryEnabled: boolean = true;
    public fileUploadEnabled: boolean = false;

    public constructor(
        public property: string,
        object: any,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, object, objectValueMapper, parent);
        this.inputComponentId = 'icon-form-input';
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        await super.initFormValueByField(field);
        const option = field?.options?.find((o) => o.option === 'ICON_LIBRARY');
        if (option) {
            this.fileUploadEnabled = !option?.value;
            this.libraryEnabled = option?.value;
        }
    }

}