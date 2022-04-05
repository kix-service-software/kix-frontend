/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../model/IdService';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';


export class ComponentState {

    public constructor(
        public textFilterValue: string = '',
        public hasFilterList: boolean = false,
        public predefinedFilterPlaceholder: string = 'Translatable#All Objects',
        public icon: string | ObjectIcon = 'kix-icon-filter',
        public placeholder: string = 'Translatable#Filter in list',
        public filterCountString: string = null,
        public showFilterCount: boolean = true,
        public disabled: boolean = false,
        public treeId: string = IdService.generateDateBasedId('predefined-filter-list-')
    ) { }

}
