/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectPropertyFilter } from '../../../../../model/KIXObjectPropertyFilter';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';

export class ComponentInput {

    public disabled: boolean;

    public icon: string | ObjectIcon;

    public showFilterCount: boolean;

    public filterCount: number;

    public predefinedFilter: KIXObjectPropertyFilter[];

    public predefinedFilterName: string;

    public filterValue: string;

}
