/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../../../model/configuration/FormFieldOption';
import { KIXObject } from '../../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { FormInstance } from '../../../../../base-components/webapp/core/FormInstance';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { ObjectReferenceOptions } from '../../../../../base-components/webapp/core/ObjectReferenceOptions';
import { JobTypes } from '../../../../../job/model/JobTypes';
import { MacroAction } from '../../../../../job/model/MacroAction';
import { MacroActionTypeOption } from '../../../../../job/model/MacroActionTypeOption';
import { ExtendedJobFormManager } from '../../../../../job/webapp/core/ExtendedJobFormManager';
import { Queue } from '../../../../model/Queue';

export class TeamSet extends ExtendedJobFormManager {

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ): Promise<FormFieldConfiguration> {
        if (
            jobType === JobTypes.TICKET
            && (actionType === 'TeamSet' || actionType === 'Team')
        ) {
            let defaultValue;
            if (action && action.Parameters) {
                defaultValue = action.Parameters[option.Name];
            }
            const field = this.getOptionField(
                option, actionType, actionFieldInstanceId, 'object-reference-input',
                defaultValue
            );
            this.setReferencedObjectOptions(field, KIXObjectType.QUEUE, false, true, false);
            field.options.push(new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true));
            field.options.push(new FormFieldOption(ObjectReferenceOptions.TEXT_AS_ID, true));
            return field;
        }
        return;
    }

    private setReferencedObjectOptions(
        field: FormFieldConfiguration, objectType: KIXObjectType, multiselect: boolean, freeText: boolean,
        autocomplete: boolean
    ): void {
        field.options.push(new FormFieldOption(ObjectReferenceOptions.OBJECT, objectType));
        field.options.push(new FormFieldOption(ObjectReferenceOptions.MULTISELECT, multiselect));
        field.options.push(new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, autocomplete));
        field.options.push(new FormFieldOption(ObjectReferenceOptions.FREETEXT, freeText));
    }

    public async postPrepareOptionValue(actionType: string, optionName: string,
        value: any, parameter: any, field: FormFieldConfiguration,
        formInstance: FormInstance): Promise<any> {
        if (actionType === 'TeamSet' && optionName === 'Team' && value && !isNaN(value)) {
            const object = await this.loadObject<Queue>(KIXObjectType.QUEUE, value);
            if (object) {
                const queueName = object.Fullname;
                return queueName;
            }
        }
    }

    private async loadObject<T extends KIXObject>(objectType: KIXObjectType, id: number): Promise<T> {
        let object: T;
        const objects = await KIXObjectService.loadObjects<T>(objectType, [id]);
        if (Array.isArray(objects) && objects.length) {
            object = objects[0];
        }

        return object;
    }
}