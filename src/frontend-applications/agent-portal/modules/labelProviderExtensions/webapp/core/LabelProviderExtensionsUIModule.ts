/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { LabelProvider } from '../../../base-components/webapp/core/LabelProvider';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { ConfigItemReferenceLabelProvider } from '../../../cmdb/webapp/core/ConfigItemReferenceLabelProvider';

export class UIModule implements IUIModule {

    public name: string = 'LabelProviderExtensionsUIModule';

    public priority: number = 9999;

    public unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {
        [
            KIXObjectType.DYNAMIC_FIELD_TYPE,
            KIXObjectType.TICKET,
            KIXObjectType.ARTICLE,
            KIXObjectType.CONTACT,
            KIXObjectType.ORGANISATION,
            KIXObjectType.FAQ_ARTICLE
        ].forEach((type) => {
            const labelProvider = LabelService.getInstance().getLabelProviderForType(type);
            if (labelProvider) {
                (labelProvider as LabelProvider).addExtendedLabelProvider(new ConfigItemReferenceLabelProvider());
            }
        });
    }

}
