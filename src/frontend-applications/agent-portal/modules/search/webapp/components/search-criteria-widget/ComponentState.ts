/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../../modules/base-components/webapp/core/AbstractComponentState';
import { Label } from '../../../../../modules/base-components/webapp/core/Label';
import { IAction } from '../../../../../modules/base-components/webapp/core/IAction';
import { AbstractDynamicFormManager } from '../../../../base-components/webapp/core/dynamic-form';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public instanceId: string = 'search-criteria-widget',
        public displayCriteria: Array<[string, string, Label[]]> = [],
        public title: string = null,
        public contentActions: IAction[] = [],
        public manager: AbstractDynamicFormManager = null,
        public canSearch: boolean = false,
        public limit: number = 50
    ) {
        super();
    }

}
