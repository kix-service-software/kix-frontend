/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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

    public priority: number = 800;

    public async register(): Promise<void> {
        ActionFactory.getInstance().registerAction('reset-user-context-widget-list', ResetUserContextWidgetListAction);
        FormValidationService.getInstance().registerValidator(new ObjectReferenceCountValidator());
        PlaceholderService.getInstance().registerPlaceholderHandler(new KIXObjectPlaceholderHandler());
    }

    public async registerExtensions(): Promise<void> {
        return;
    }

}
