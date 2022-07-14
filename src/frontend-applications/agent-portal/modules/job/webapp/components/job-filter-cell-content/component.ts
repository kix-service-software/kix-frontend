/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { SearchDefinition, SearchService } from '../../../../search/webapp/core';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';

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
