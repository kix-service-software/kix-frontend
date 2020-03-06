/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../../../../../model/Context";
import { LabelService } from "../../../../../../../modules/base-components/webapp/core/LabelService";
import { User } from "../../../../../model/User";
import { BreadcrumbInformation } from "../../../../../../../model/BreadcrumbInformation";
import { AdminContext } from "../../../../../../admin/webapp/core";
import { KIXObject } from "../../../../../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../../../../../model/kix/KIXObjectType";
import { KIXObjectLoadingOptions } from "../../../../../../../model/KIXObjectLoadingOptions";
import { UserProperty } from "../../../../../model/UserProperty";
import { EventService } from "../../../../../../../modules/base-components/webapp/core/EventService";
import { ApplicationEvent } from "../../../../../../../modules/base-components/webapp/core/ApplicationEvent";
import { TranslationService } from "../../../../../../../modules/translation/webapp/core/TranslationService";
import { KIXObjectService } from "../../../../../../../modules/base-components/webapp/core/KIXObjectService";
import { Role } from "../../../../../model/Role";

export class UserDetailsContext extends Context {

    public static CONTEXT_ID = 'user-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<User>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await TranslationService.translate('Translatable#User');
        const object = await this.getObject<User>();
        const text = await LabelService.getInstance().getText(object);
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
        const userId = Number(this.objectId);

        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, [UserProperty.PREFERENCES, UserProperty.ROLE_IDS, UserProperty.CONTACT]
        );

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Load User'
            });
        }, 500);

        const users = await KIXObjectService.loadObjects<User>(
            KIXObjectType.USER, [userId], loadingOptions, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let user: User;
        if (users && users.length) {
            user = users[0];
            this.objectId = user.UserID;
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return user;
    }

}
