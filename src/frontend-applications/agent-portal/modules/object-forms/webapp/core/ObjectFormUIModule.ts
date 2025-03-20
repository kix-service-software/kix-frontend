/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
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
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { ContextDescriptor } from '../../../../model/ContextDescriptor';
import { ObjectFormConfigurationContext } from './ObjectFormConfigurationContext';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';

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

        const descriptor = new ContextDescriptor(
            ObjectFormConfigurationContext.CONTEXT_ID, [KIXObjectType.ANY], ContextType.DIALOG,
            ContextMode.EDIT, true, null, [], ObjectFormConfigurationContext
        );
        ContextService.getInstance().registerContext(descriptor);
    }

    public async registerExtensions(): Promise<void> {
        return;
    }

}
