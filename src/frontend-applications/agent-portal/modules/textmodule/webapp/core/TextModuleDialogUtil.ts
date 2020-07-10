/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextMode } from '../../../../model/ContextMode';
import { NewTextModuleDialogContext } from './context';
import { TextModule } from '../../model/TextModule';

export class TextModuleDialogUtil {

    public static async create(): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewTextModuleDialogContext.CONTEXT_ID, KIXObjectType.TEXT_MODULE, ContextMode.CREATE_ADMIN, null, true,
            'Translatable#Ticket'
        );
    }

    public static async duplicate(textModule: TextModule): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewTextModuleDialogContext.CONTEXT_ID, KIXObjectType.TEXT_MODULE, ContextMode.CREATE_ADMIN, textModule.ID,
            true, 'Translatable#Ticket'
        );
    }

}
