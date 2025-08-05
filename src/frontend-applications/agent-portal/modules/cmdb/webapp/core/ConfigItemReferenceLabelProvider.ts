/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { Label } from '../../../base-components/webapp/core/Label';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { ObjectReferenceLabelProvider } from '../../../base-components/webapp/core/ObjectReferenceLabelProvider';
import { DynamicFieldType } from '../../../dynamic-fields/model/DynamicFieldType';
import { DynamicFieldTypes } from '../../../dynamic-fields/model/DynamicFieldTypes';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { ConfigItem } from '../../model/ConfigItem';
import { ConfigItemProperty } from '../../model/ConfigItemProperty';
import { VersionProperty } from '../../model/VersionProperty';

export class ConfigItemReferenceLabelProvider extends ObjectReferenceLabelProvider {

    public constructor() {
        super();
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, [ConfigItemProperty.CURRENT_VERSION, VersionProperty.PREPARED_DATA]
        );
        this.objectLoader.setLoadingoptions(KIXObjectType.CONFIG_ITEM, loadingOptions);
    }

    public isLabelProviderForDFType(dfFieldType: string): boolean {
        return dfFieldType === DynamicFieldTypes.CI_REFERENCE;
    }

    protected async getObject(value: any): Promise<ConfigItem> {
        return this.objectLoader.queue<ConfigItem>(KIXObjectType.CONFIG_ITEM, value);
    }

    protected async getLabel(configItem: ConfigItem): Promise<Label> {
        let label;
        const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.CONFIG_ITEM);
        if (labelProvider) {
            label = await labelProvider.getLabelByObject(configItem);
        }
        if (!label) {
            const title = await LabelService.getInstance().getObjectText(configItem, true) || configItem.Name;
            label = new Label(
                configItem, configItem.ConfigItemID, 'kix-icon-ci', title, null, title, true
            );
        }
        return label;
    }

    public getObjectIcon(dynamicFieldType?: DynamicFieldType): string | ObjectIcon {
        let objectIcon = null;

        if (dynamicFieldType?.Name === DynamicFieldTypes.CI_REFERENCE) {
            objectIcon = 'kix-icon-ci';
        }
        return objectIcon;
    }
}
