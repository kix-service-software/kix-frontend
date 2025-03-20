/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../../model/IdService';
import { AbstractComponentState } from '../../../../../base-components/webapp/core/AbstractComponentState';
import { CheckListItem } from '../../../../../dynamic-fields/model/CheckListItem';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public value: CheckListItem[] = [],
        public prepared: boolean = false,
        public progressValue: number = 0,
        public progressText: string = '',
        public checklistId: string = IdService.generateDateBasedId('-checklist'),
        public readonly: boolean = false
    ) {
        super();
    }

}