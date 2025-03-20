/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { NewTextModuleDialogContext } from './context';
import { TextModule } from '../../model/TextModule';

export class TextModuleDialogUtil {

    public static async create(): Promise<void> {
        ContextService.getInstance().setActiveContext(NewTextModuleDialogContext.CONTEXT_ID);
    }

    public static async duplicate(textModule: TextModule): Promise<void> {
        ContextService.getInstance().setActiveContext(NewTextModuleDialogContext.CONTEXT_ID, textModule.ID);
    }

}
