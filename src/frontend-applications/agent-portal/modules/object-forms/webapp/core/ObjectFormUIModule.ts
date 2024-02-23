/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IUIModule } from '../../../../model/IUIModule';
import { ObjectFormRegistry } from './ObjectFormRegistry';
import { DateTimeFormValueValidator } from './validation/validator/DateTimeFormValueValidator';
import { PossibleValuesValidator } from './validation/validator/PossibleValuesValidator';
import { RequiredFormValueValidator } from './validation/validator/RequiredFormValueValidator';
import { SelectionFormValueValidator } from './validation/validator/SelectionFormValueValidator';
import { RegexFormValueValidator } from './validation/validator/RegexFormValueValidator';
import { DynamicFieldTableValidator } from './validation/validator/dynamic-fields/DynamicFieldTableValidator';
import { DynamicFieldChecklistValidator } from './validation/validator/dynamic-fields/DynamicFieldChecklistValidator';

export class UIModule implements IUIModule {

    public name: string = 'ObjectFormUIModule';

    public priority: number = 5000;

    public async register(): Promise<void> {
        ObjectFormRegistry.getInstance().registerObjectFormValueValidator(RequiredFormValueValidator);
        ObjectFormRegistry.getInstance().registerObjectFormValueValidator(SelectionFormValueValidator);
        ObjectFormRegistry.getInstance().registerObjectFormValueValidator(DateTimeFormValueValidator);
        ObjectFormRegistry.getInstance().registerObjectFormValueValidator(PossibleValuesValidator);
        ObjectFormRegistry.getInstance().registerObjectFormValueValidator(RegexFormValueValidator);
        ObjectFormRegistry.getInstance().registerObjectFormValueValidator(DynamicFieldTableValidator);
        ObjectFormRegistry.getInstance().registerObjectFormValueValidator(DynamicFieldChecklistValidator);
    }

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

}
