/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';

export class UIModule implements IUIModule {

    public name: string = 'PortlNotificationUIModule';

    public priority: number = 5000;

    public async register(): Promise<void> {
        // register some module stuff, e.g. Context, LabelProvider, TableFactory, Actions, ...
    }

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

}