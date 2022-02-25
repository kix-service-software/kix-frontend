/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../table/webapp/core/factory/TableFactoryService';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { ActionFactory } from '../../../base-components/webapp/core/ActionFactory';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { OAuth2ProfileFormService } from './OAuth2ProfileFormService';
import { OAuth2ProfileLabelProvider } from './OAuth2ProfileLabelProvider';
import { OAuth2ProfileCreateAction } from './actions/OAuth2ProfileCreateAction';
import { EditOAuth2ProfileDialogContext, NewOAuth2ProfileDialogContext } from './context';
import { OAuth2ProfileTableDeleteAction } from './actions/OAuth2ProfileTableDeleteAction';
import { OAuth2ProfileTableFactory } from './table/OAuth2ProfileTableFactory';
import { OAuth2Service } from './OAuth2Service';
import { BrowserCacheService } from '../../../base-components/webapp/core/CacheService';

export class UIModule implements IUIModule {

    public priority: number = 10000;

    public name: string = 'OAuth2UIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public async register(): Promise<void> {

        BrowserCacheService.getInstance().addDependencies(
            KIXObjectType.OAUTH2_PROFILE_AUTH, [KIXObjectType.OAUTH2_PROFILE]
        );

        ServiceRegistry.registerServiceInstance(OAuth2Service.getInstance());
        ServiceRegistry.registerServiceInstance(OAuth2ProfileFormService.getInstance());
        TableFactoryService.getInstance().registerFactory(new OAuth2ProfileTableFactory());
        LabelService.getInstance().registerLabelProvider(new OAuth2ProfileLabelProvider());

        ActionFactory.getInstance().registerAction('oauth2-profile-create', OAuth2ProfileCreateAction);

        const newProfileDialogContext = new ContextDescriptor(
            NewOAuth2ProfileDialogContext.CONTEXT_ID, [KIXObjectType.OAUTH2_PROFILE],
            ContextType.DIALOG, ContextMode.CREATE_ADMIN,
            false, 'object-dialog', ['oauth2-profiles'], NewOAuth2ProfileDialogContext,
            [
                new UIComponentPermission('system/oauth2/profiles', [CRUD.CREATE])
            ],
            'Translatable#New Profile', 'fas fa-file-contract'
        );
        ContextService.getInstance().registerContext(newProfileDialogContext);

        ActionFactory.getInstance().registerAction('oauth2-profile-table-delete', OAuth2ProfileTableDeleteAction);

        const editProfileDialogContext = new ContextDescriptor(
            EditOAuth2ProfileDialogContext.CONTEXT_ID, [KIXObjectType.OAUTH2_PROFILE],
            ContextType.DIALOG, ContextMode.EDIT_ADMIN,
            false, 'object-dialog', ['oauth2-profiles'], EditOAuth2ProfileDialogContext,
            [
                new UIComponentPermission('system/oauth2/profiles', [CRUD.CREATE])
            ],
            'Translatable#Edit Profile', 'fas fa-file-contract'
        );
        ContextService.getInstance().registerContext(editProfileDialogContext);
    }
}
