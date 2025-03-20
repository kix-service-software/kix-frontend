/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { Cell } from '../../../../table/model/Cell';
import { JobFilterTableProperty } from '../../../../job/webapp/core/table/JobFilterTableProperty';
import { InputFieldTypes } from '../../../../base-components/webapp/core/InputFieldTypes';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { SearchService } from '../../../../search/webapp/core/SearchService';
import { SearchDefinition } from '../../../../search/webapp/core/SearchDefinition';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        if (input.cell) {
            const searchDefinition = SearchService.getInstance().getSearchDefinition(KIXObjectType.TICKET);
            const manager = searchDefinition.createFormManager();
            const propertyCell = (input.cell as Cell).getRow().getCell(JobFilterTableProperty.FIELD);
            const operatorCell = (input.cell as Cell).getRow().getCell(JobFilterTableProperty.OPERATOR);
            const inputType = propertyCell && manager
                ? await manager.getInputType(propertyCell.getValue().objectValue, operatorCell.getValue().objectValue)
                : null;
            // no sort for relative values
            this.state.doLabelSort = !SearchDefinition.getRelativeDateTimeOperators().includes(
                operatorCell.getValue().objectValue
            );
            this.state.isLabelCell = inputType === InputFieldTypes.DROPDOWN
                || inputType === InputFieldTypes.OBJECT_REFERENCE
                || inputType === InputFieldTypes.DATE
                || inputType === InputFieldTypes.DATE_TIME;
        }
        this.state.cell = input.cell;
    }


}

module.exports = Component;
