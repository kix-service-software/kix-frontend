/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { ServiceType } from '../../../base-components/webapp/core/ServiceType';
import { ObjectTagLabelProvider } from './ObjectTagLabelProvider';
import { ObjectTagService } from './ObjectTagService';
import { KIXObjectFormService } from '../../../base-components/webapp/core/KIXObjectFormService';
import { ObjectTagFormService } from './ObjectTagFormService';
import { SysConfigService } from '../../../sysconfig/webapp/core';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { BrowserCacheService } from '../../../base-components/webapp/core/CacheService';

export class UIModule implements IUIModule {

    public name: string = 'ObjectTagUIModule';

    public priority: number = 800;

    public async register(): Promise<void> {
        ServiceRegistry.registerServiceInstance(ObjectTagService.getInstance());

        LabelService.getInstance().registerLabelProvider(new ObjectTagLabelProvider());
    }

    public async registerExtensions(): Promise<void> {
        const config = await SysConfigService.getInstance().getSysConfigOptionValue(
            'ObjectTag::ObjectTypes'
        );
        if (config) {
            const objectTypes = await this.prepareTypes(config);
            for ( const objectType of objectTypes ) {

                const formService = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
                    objectType[0], ServiceType.FORM
                );
                if (formService) {
                    formService.addExtendedKIXObjectFormService(new ObjectTagFormService());
                    BrowserCacheService.getInstance().addDependencies(
                        objectType[0], [KIXObjectType.OBJECT_TAG, KIXObjectType.OBJECT_TAG_LINK]
                    );
                }
            }
        }
    }

    private async prepareTypes(config:any): Promise<Map<string,string>> {
        const types:Map<string,string> = new Map();
        Object.keys(config).forEach((entry: string) => {
            types.set(entry, config[entry]);
        });
        const sorted:Map<string,string> = new Map([...types.entries()].sort());
        return sorted;
    }
}
