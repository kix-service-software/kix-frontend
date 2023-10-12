/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IInitialDataExtension } from '../../model/IInitialDataExtension';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { DynamicFieldAPIService } from '../dynamic-fields/server/DynamicFieldService';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { FilterCriteria } from '../../model/FilterCriteria';
import { DynamicFieldProperty } from '../dynamic-fields/model/DynamicFieldProperty';
import { SearchOperator } from '../search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { DynamicField } from '../dynamic-fields/model/DynamicField';
import { LoggingService } from '../../../../server/services/LoggingService';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IInitialDataExtension {

    public name: string = 'Calendar Module';

    public async createData(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();

        const filter = [
            new FilterCriteria(
                DynamicFieldProperty.NAME, SearchOperator.IN, FilterDataType.STRING,
                FilterType.AND, ['PlanBegin', 'PlanEnd']
            )
        ];

        const objectResponse = await DynamicFieldAPIService.getInstance().loadObjects<DynamicField>(
            serverConfig.BACKEND_API_TOKEN, 'calendar-initial-data',
            KIXObjectType.DYNAMIC_FIELD, null, new KIXObjectLoadingOptions(filter), null
        );

        const fields = objectResponse?.objects || [];

        if (fields) {
            const config = {
                CountDefault: '0', CountMax: '1', CountMin: '0',
                DateRestriction: 'none', DefaultValue: '0', ItemSeparator: '',
                YearsInFuture: '0', YearsInPast: '0'
            };

            const parameter: Array<[string, any]> = [
                [DynamicFieldProperty.FIELD_TYPE, 'DateTime'],
                [DynamicFieldProperty.OBJECT_TYPE, 'Ticket'],
                [DynamicFieldProperty.CONFIG, config]
            ];

            if (!fields.some((f) => f.Name === 'PlanBegin')) {
                await DynamicFieldAPIService.getInstance().createObject(
                    serverConfig.BACKEND_API_TOKEN, '', KIXObjectType.DYNAMIC_FIELD,
                    [
                        ...parameter,
                        [DynamicFieldProperty.NAME, 'PlanBegin'],
                        [DynamicFieldProperty.LABEL, 'Plan Begin']
                        // "Translatable#Plan Begin" - for extract-translatables script
                    ]
                ).catch((error) => {
                    LoggingService.getInstance().error('Could not create dynamic field PlanBegin', error);
                });
            }

            if (!fields.some((f) => f.Name === 'PlanEnd')) {
                await DynamicFieldAPIService.getInstance().createObject(
                    serverConfig.BACKEND_API_TOKEN, '', KIXObjectType.DYNAMIC_FIELD,
                    [
                        ...parameter,
                        [DynamicFieldProperty.NAME, 'PlanEnd'],
                        [DynamicFieldProperty.LABEL, 'Plan End']
                        // "Translatable#Plan End" - for extract-translatables script
                    ]
                ).catch((error) => {
                    LoggingService.getInstance().error('Could not create dynamic field PlanEnd', error);
                });
            }
        }
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
