/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../../../model/Context';
import { LabelService } from '../../../../../../../modules/base-components/webapp/core/LabelService';
import { ConfigItemClass } from '../../../../../model/ConfigItemClass';
import { BreadcrumbInformation } from '../../../../../../../model/BreadcrumbInformation';
import { TranslationService } from '../../../../../../../modules/translation/webapp/core/TranslationService';
import { AdminContext } from '../../../../../../admin/webapp/core/AdminContext';
import { KIXObject } from '../../../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../../model/KIXObjectLoadingOptions';

export class ConfigItemClassDetailsContext extends Context {

    public static CONTEXT_ID = 'config-item-class-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getObjectText(await this.getObject<ConfigItemClass>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await TranslationService.translate('Translatable#CI Class');
        const state = await this.getObject<ConfigItemClass>();
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${state.Name}`);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS,
        reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadCIClass();

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(
                    Number(this.objectId), object, KIXObjectType.CONFIG_ITEM_CLASS, changedProperties
                )
            );
        }

        return object as any;
    }

    private async loadCIClass(): Promise<ConfigItemClass> {
        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.includes = ['CurrentDefinition', 'Definitions', 'ConfiguredPermissions'];
        loadingOptions.cacheType = `${KIXObjectType.CONFIG_ITEM_CLASS}_DEFINITION`;

        return await this.loadDetailsObject<ConfigItemClass>(
            KIXObjectType.CONFIG_ITEM_CLASS, loadingOptions
        );
    }

}
