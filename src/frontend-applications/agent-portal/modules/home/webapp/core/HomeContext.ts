/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../model/Context';

export class HomeContext extends Context {

    public static CONTEXT_ID: string = 'home';

    public getIcon(): string {
        return 'kix-icon-home';
    }

    public async getDisplayText(): Promise<string> {
        return 'Home';
    }

    public getAdditionalInformation(key: string): any {
        return key === 'IGNORE_OBJECT_DEPENDENCY_CHECK' ? true : super.getAdditionalInformation(key);
    }

}
