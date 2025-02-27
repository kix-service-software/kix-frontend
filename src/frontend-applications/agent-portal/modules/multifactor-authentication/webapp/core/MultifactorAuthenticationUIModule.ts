/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectFormService } from '../../../base-components/webapp/core/KIXObjectFormService';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { ServiceType } from '../../../base-components/webapp/core/ServiceType';
import { ObjectFormRegistry } from '../../../object-forms/webapp/core/ObjectFormRegistry';
import { MFAPersonalSettingsFormService } from './MFAPersonalSettingsFormService';
import { ExtendedContactFormObjectValueMapper } from './form/ExtendedContactFormObjectValueMapper';

export class UIModule implements IUIModule {

    public name: string = 'MultifactorAuthenticationUIModule';

    public priority: number = 5000;

    public async register(): Promise<void> {
        // register some module stuff, e.g. Context, LabelProvider, TableFactory, Actions, ...
    }

    public async registerExtensions(): Promise<void> {
        const personalSettingsFormService = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
            KIXObjectType.PERSONAL_SETTINGS, ServiceType.FORM
        );
        if (personalSettingsFormService) {
            personalSettingsFormService.addExtendedKIXObjectFormService(new MFAPersonalSettingsFormService());
        }

        ObjectFormRegistry.getInstance().registerObjectValueMapperExtension(ExtendedContactFormObjectValueMapper);

    }

}