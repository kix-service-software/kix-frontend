/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractJobFormManager } from './AbstractJobFormManager';
import { SearchService } from '../../../search/webapp/core';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SearchProperty } from '../../../search/model/SearchProperty';

export class TicketJobFormManager extends AbstractJobFormManager {

    public constructor() {
        super();
        const searchDefinition = SearchService.getInstance().getSearchDefinition(KIXObjectType.TICKET);
        if (searchDefinition) {
            this.filterManager = searchDefinition.createFormManager([SearchProperty.FULLTEXT], false);
            this.filterManager.init = () => {

                // get extended managers on init because they could be added after filterManager was created
                if (searchDefinition) {
                    this.filterManager['extendedFormManager'] = [];
                    searchDefinition.formManager.getExtendedFormManager().forEach(
                        (m) => this.filterManager.addExtendedFormManager(m)
                    );
                }
            };
        }
    }
}
