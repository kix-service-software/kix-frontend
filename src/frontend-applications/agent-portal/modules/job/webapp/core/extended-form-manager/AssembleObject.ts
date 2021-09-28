/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DefaultSelectInputFormOption } from '../../../../../model/configuration/DefaultSelectInputFormOption';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../../model/configuration/FormFieldOption';
import { FormFieldOptions } from '../../../../../model/configuration/FormFieldOptions';
import { IdService } from '../../../../../model/IdService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { MacroAction } from '../../../model/MacroAction';
import { MacroActionTypeOption } from '../../../model/MacroActionTypeOption';
import { ExtendedJobFormManager } from '../ExtendedJobFormManager';

export class AssembleObject extends ExtendedJobFormManager {

    private subscriber: IEventSubscriber;

    public constructor() {
        super();

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('AssembleObject'),
            eventPublished: (data: FormValuesChangedEventData, eventId: string): void => {
                const definitionValue = data.changedValues.find(
                    (cv) => cv[0] && cv[0].property === 'AssembleObjectType'
                );
                if (definitionValue && definitionValue[1]) {
                    const type = Array.isArray(definitionValue[1]?.value) ? definitionValue[1].value[0] : 'JSON';

                    const definitionField = definitionValue[0]?.parent?.children?.find(
                        (p) => p.property === 'AssembleObjectDefinition'
                    );
                    this.handleType(data.formInstance, definitionField, type);
                }
            }
        };

        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.subscriber);
    }

    private handleType(formInstance: FormInstance, definitionField: FormFieldConfiguration, type: string): void {
        type = type === 'JSON' ? 'javascript' : 'yaml';

        const option = definitionField.options.find((o) => o.option === FormFieldOptions.LANGUAGE);
        if (option) {
            option.value = type;
        }

        formInstance.addFieldChildren(definitionField, [], true);
    }

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ): Promise<FormFieldConfiguration> {
        if (actionType === 'AssembleObject') {
            if (option.Name === 'Type') {
                const defaultValue = action?.Parameters[option.Name] || 'JSON';

                const field = this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'default-select-input', defaultValue
                );
                field.property = 'AssembleObjectType';

                const nodes = [
                    new TreeNode('JSON', 'JSON'),
                    new TreeNode('YAML', 'YAML')
                ];

                field.options.push(new FormFieldOption(DefaultSelectInputFormOption.MULTI, false));
                field.options.push(new FormFieldOption(DefaultSelectInputFormOption.NODES, nodes));

                return field;
            } else if (option.Name === 'Definition') {
                let defaultValue;
                if (action && action.Parameters) {
                    defaultValue = action.Parameters[option.Name];
                }

                const field = this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'text-area-input', defaultValue
                );
                field.property = 'AssembleObjectDefinition';

                const type = defaultValue === 'JSON' ? 'javascript' : 'yaml';
                field.options.push(new FormFieldOption(FormFieldOptions.LANGUAGE, type));

                return field;
            }
        }
        return;
    }

    public postPrepareOptionValue(actionType: string, optionName: string, value: any, parameter: any): any {
        if (actionType === 'AssembleObject' && optionName === 'Type' && Array.isArray(value)) {
            return value[0];
        }
        return;
    }
}
