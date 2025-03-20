/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';

export class UIModule implements IUIModule {

    public name: string = 'FileUIModule';

    public priority: number = 5000;

    public async register(): Promise<void> {
        // register some module stuff, e.g. Context, LabelProvider, TableFactory, Actions, ...
    }

    public async unRegister(): Promise<void> {
        return;
    }

    public async registerExtensions(): Promise<void> {
        return;
    }

}