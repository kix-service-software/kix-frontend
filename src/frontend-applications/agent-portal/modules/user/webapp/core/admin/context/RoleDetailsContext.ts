/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../../model/Context';
import { LabelService } from '../../../../../../modules/base-components/webapp/core/LabelService';
import { Role } from '../../../../model/Role';
import { BreadcrumbInformation } from '../../../../../../model/BreadcrumbInformation';
import { KIXObject } from '../../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { RoleProperty } from '../../../../model/RoleProperty';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { User } from '../../../../model/User';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { AdminContext } from '../../../../../admin/webapp/core/AdminContext';


export class RoleDetailsContext extends Context {

    public static CONTEXT_ID = 'user-role-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getObjectText(await this.getObject<Role>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await TranslationService.translate('Translatable#Role');
        const object = await this.getObject<Role>();
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${object.Name}`);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType | string = KIXObjectType.ROLE, reload: boolean = false,
        changedProperties: string[] = []
    ): Promise<O> {
        const role = await this.loadRole(changedProperties);

        if (role && role.UserIDs && role.UserIDs.length > 0) {
            const users = await KIXObjectService.loadObjects<User>(
                KIXObjectType.USER, role.UserIDs, null, null, null, true, true
            );
            this.setObjectList(KIXObjectType.USER, users, true);
        }

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), role, KIXObjectType.ROLE, changedProperties)
            );
        }

        return role as any;
    }

    private async loadRole(changedProperties: string[] = [], cache: boolean = true): Promise<Role> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, [RoleProperty.USER_IDS, RoleProperty.PERMISSIONS]
        );

        return await this.loadDetailsObject<Role>(KIXObjectType.ROLE, loadingOptions);
    }

}
