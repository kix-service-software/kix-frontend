/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../../modules/base-components/webapp/core/AbstractComponentState';
import { Label } from '../../../../../modules/base-components/webapp/core/Label';
import { IAction } from '../../../../../modules/base-components/webapp/core/IAction';
import { SearchFormManager } from '../../../../base-components/webapp/core/SearchFormManager';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public instanceId: string = 'search-criteria-widget',
        public displayCriteria: Array<[string, string, Label[]]> = [],
        public title: string = null,
        public contentActions: IAction[] = [],
        public manager: SearchFormManager = null,
        public canSearch: boolean = false,
        public sortAttribute: string = null,
        public sortDescending: boolean = false,
        public sortTreeId: string = null
    ) {
        super();
    }

}
