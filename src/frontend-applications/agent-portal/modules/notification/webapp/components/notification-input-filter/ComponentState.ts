/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponentState } from '../../../../../modules/base-components/webapp/core/FormInputComponentState';
import { AbstractDynamicFormManager } from '../../../../base-components/webapp/core/dynamic-form';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { SearchProperty } from '../../../../search/model/SearchProperty';
import { TicketSearchFormManager } from '../../../../ticket/webapp/core/TicketSearchFormManager';
import { SearchService } from '../../../../search/webapp/core/SearchService';

export class ComponentState extends FormInputComponentState {

    public constructor(
        public manager: AbstractDynamicFormManager = null,
        public prepared: boolean = false
    ) {
        super();
        const searchDefinition = SearchService.getInstance().getSearchDefinition(KIXObjectType.TICKET);
        this.manager = searchDefinition.createFormManager([SearchProperty.FULLTEXT], false);
        // do not mark viewable states as required
        (this.manager as TicketSearchFormManager).handleViewableStateType = false;
    }

}
