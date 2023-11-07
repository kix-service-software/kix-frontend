/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { Label } from '../../../base-components/webapp/core/Label';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { ObjectReferenceLabelProvider } from '../../../base-components/webapp/core/ObjectReferenceLabelProvider';
import { DynamicFieldType } from '../../../dynamic-fields/model/DynamicFieldType';
import { DynamicFieldTypes } from '../../../dynamic-fields/model/DynamicFieldTypes';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { ConfigItem } from '../../model/ConfigItem';
import { ConfigItemProperty } from '../../model/ConfigItemProperty';

export class ConfigItemReferenceLabelProvider extends ObjectReferenceLabelProvider {

    public isLabelProviderForDFType(dfFieldType: string): boolean {
        return dfFieldType === DynamicFieldTypes.CI_REFERENCE;
    }

    protected async getObject(value: any): Promise<ConfigItem[]> {
        return KIXObjectService.loadObjects<ConfigItem>(
            KIXObjectType.CONFIG_ITEM, [value],
            new KIXObjectLoadingOptions(
                null, null, null, [ConfigItemProperty.CURRENT_VERSION]
            ), null, true
        );
    }

    protected async getLabel(configItem: ConfigItem): Promise<Label> {
        const title = await LabelService.getInstance().getObjectText(configItem, true);
        return new Label(
            configItem, configItem.ConfigItemID, 'kix-icon-ci', title, null, title, true
        );
    }

    public getObjectIcon(dynamicFieldType?: DynamicFieldType): string | ObjectIcon {
        let objectIcon = null;

        if (dynamicFieldType?.Name === DynamicFieldTypes.CI_REFERENCE) {
            objectIcon = 'kix-icon-ci';
        }
        return objectIcon;
    }
}
