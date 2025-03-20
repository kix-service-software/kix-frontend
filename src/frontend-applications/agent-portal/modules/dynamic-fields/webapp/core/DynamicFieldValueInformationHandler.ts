/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { InformationConfiguration } from '../../../base-components/webapp/components/object-information-card-widget/ObjectInformationCardConfiguration';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { ObjectInformationComponentHandler } from '../../../base-components/webapp/core/ObjectInformationComponentHandler';

export class DynamicFieldValueInformationHandler extends ObjectInformationComponentHandler {

    public async prepareComponentInformation(
        infoValue: InformationConfiguration, value: InformationConfiguration, object: KIXObject
    ): Promise<boolean> {
        const name = value.componentData?.name;

        let success = true;

        if (!name) {
            console.warn('Dynamic Field Value: Required componentData "name" is missing');
            success = false;
        }

        const dynamicField = await KIXObjectService.loadDynamicField(name);
        if (!dynamicField) {
            console.warn(`Dynamic Field Value: No dynamic field with name: ${name} available.`);
            success = false;
        }

        if (!success) {
            console.warn(value);
        }

        infoValue.componentData.name = name;

        return success;
    }


}