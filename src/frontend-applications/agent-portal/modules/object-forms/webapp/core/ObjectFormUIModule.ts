/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { DynamicFieldDateTimeValidator } from './validation/validator/dynamic-fields/DynamicFieldDateTimeValidator';
import { RegexFormValueValidator } from './validation/validator/RegexFormValueValidator';

export class UIModule implements IUIModule {

    public name: string = 'ObjectFormUIModule';

    public priority: number = 5000;

    public async register(): Promise<void> {
        ObjectFormRegistry.getInstance().registerObjectFormValueValidator(RequiredFormValueValidator);
        ObjectFormRegistry.getInstance().registerObjectFormValueValidator(SelectionFormValueValidator);
        ObjectFormRegistry.getInstance().registerObjectFormValueValidator(DateTimeFormValueValidator);
        ObjectFormRegistry.getInstance().registerObjectFormValueValidator(PossibleValuesValidator);
        ObjectFormRegistry.getInstance().registerObjectFormValueValidator(DynamicFieldDateTimeValidator);
        ObjectFormRegistry.getInstance().registerObjectFormValueValidator(RegexFormValueValidator);
    }

    public async unRegister(): Promise<void> {
        throw new Error('Method not implemented.');
    }

}
