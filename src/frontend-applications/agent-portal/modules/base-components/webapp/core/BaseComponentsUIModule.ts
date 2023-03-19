/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ActionFactory } from '../../../../modules/base-components/webapp/core/ActionFactory';
import { FormValidationService } from './FormValidationService';
import { KIXObjectPlaceholderHandler } from './KIXObjectPlaceholderHandler';
import { ObjectReferenceCountValidator } from './ObjectReferenceCountValidator';
import { PlaceholderService } from './PlaceholderService';
import { ResetUserContextWidgetListAction } from './ResetUserContextWidgetListAction';

export class UIModule implements IUIModule {

    public name: string = 'BaseComponentsUIModule';

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    public priority: number = 800;

    public async register(): Promise<void> {
        ActionFactory.getInstance().registerAction('reset-user-context-widget-list', ResetUserContextWidgetListAction);
        FormValidationService.getInstance().registerValidator(new ObjectReferenceCountValidator());
        PlaceholderService.getInstance().registerPlaceholderHandler(new KIXObjectPlaceholderHandler());
    }

}
