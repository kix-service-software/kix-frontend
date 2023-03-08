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
import { User } from '../../../../../model/User';
import { BreadcrumbInformation } from '../../../../../../../model/BreadcrumbInformation';
import { KIXObject } from '../../../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../../model/KIXObjectLoadingOptions';
import { UserProperty } from '../../../../../model/UserProperty';
import { TranslationService } from '../../../../../../../modules/translation/webapp/core/TranslationService';
import { KIXObjectService } from '../../../../../../../modules/base-components/webapp/core/KIXObjectService';
import { Role } from '../../../../../model/Role';
import { AdminContext } from '../../../../../../admin/webapp/core/AdminContext';

export class UserDetailsContext extends Context {

    public static CONTEXT_ID = 'user-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getObjectText(await this.getObject<User>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await TranslationService.translate('Translatable#User');
        const object = await this.getObject<User>();
        const text = await LabelService.getInstance().getObjectText(object);
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${text}`);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType | string = KIXObjectType.USER,
        reload: boolean = false,
        changedProperties: string[] = []
    ): Promise<O> {
        const user = await this.loadUser(changedProperties);

        if (user && user.RoleIDs && user.RoleIDs.length > 0) {
            const roles = await KIXObjectService.loadObjects<Role>(KIXObjectType.ROLE, user.RoleIDs);
            this.setObjectList(KIXObjectType.ROLE, roles, true);
        }

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), user, KIXObjectType.USER, changedProperties)
            );
        }

        return user as any;
    }

    private async loadUser(changedProperties: string[] = [], cache: boolean = true): Promise<User> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, [UserProperty.PREFERENCES, UserProperty.ROLE_IDS, UserProperty.CONTACT]
        );

        return await this.loadDetailsObject<User>(KIXObjectType.USER, loadingOptions, null, true, cache, true);
    }

}
