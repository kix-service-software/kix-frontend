/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectSearchService } from './ObjectSearchService';
import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { BrowserCacheService } from '../../../base-components/webapp/core/CacheService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export class UIModule implements IUIModule {

    public name: string = 'ObjectSearchUIModule';

    public priority: number = 90;

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(ObjectSearchService.getInstance());
        BrowserCacheService.getInstance().addDependencies(KIXObjectType.DYNAMIC_FIELD, [KIXObjectType.OBJECT_SEARCH]);
    }

    public async registerExtensions(): Promise<void> {
        return;
    }

}
