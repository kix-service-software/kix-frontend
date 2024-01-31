/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';

export interface IAction<T = any> {

    id: string;

    text: string;

    icon: string | ObjectIcon;

    data: T;

    hasLink: boolean;

    initAction(): Promise<void>;

    setData(data: T): Promise<void>;

    canRun(): boolean;

    canShow(): Promise<boolean>;

    run(event: any): void;

    getLinkData(): Promise<string>;

    permissions: UIComponentPermission[];

}
