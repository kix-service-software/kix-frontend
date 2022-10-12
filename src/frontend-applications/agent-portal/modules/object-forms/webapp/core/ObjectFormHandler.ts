/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Error } from '../../../../../../server/model/Error';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { Context } from '../../../../model/Context';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { ComponentContent } from '../../../base-components/webapp/core/ComponentContent';
import { FormFactory } from '../../../base-components/webapp/core/FormFactory';
import { OverlayService } from '../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../base-components/webapp/core/OverlayType';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ObjectFormValue } from '../../model/FormValues/ObjectFormValue';
import { ObjectFormValueMapper } from '../../model/ObjectFormValueMapper';
import { RuleResult } from '../../model/RuleResult';
import { ObjectFormRegistry } from './ObjectFormRegistry';
import { ObjectFormValidator } from './validation/ObjectFormValidator';

export class ObjectFormHandler<T extends KIXObject = any> {

    public constructor(public context: Context) { }

    private form: FormConfiguration;

    public objectFormValueMapper: ObjectFormValueMapper;
    public objectFormValidator: ObjectFormValidator;

    public destroy(): void {
        this.objectFormValueMapper?.destroy();
        this.objectFormValidator?.destroy();
    }

    public async loadForm(createNewInstance?: boolean): Promise<void> {
        this.form = this.context.getFormManager().getForm();
        FormFactory.initForm(this.form);

        this.objectFormValueMapper?.destroy();
        this.objectFormValidator?.destroy();

        this.objectFormValueMapper = ObjectFormRegistry.getInstance().createObjectFormValueMapper(
            this.form?.objectType || this.context.descriptor.kixObjectTypes[0], this
        );
        if (this.objectFormValueMapper) {
            this.objectFormValueMapper.formContext = this.form?.formContext;
            this.objectFormValueMapper.setFormConfiguration(this.form);

            const formObject = await this.context.getObject(
                this.form?.objectType || this.context.descriptor.kixObjectTypes[0], createNewInstance
            );
            await this.objectFormValueMapper.mapFormValues(formObject);

            this.objectFormValidator = new ObjectFormValidator(this.objectFormValueMapper);
        }
    }

    public getFormValues(): ObjectFormValue[] {
        return this.objectFormValueMapper?.getFormValues();
    }

    public getObjectFormCreator(): ObjectFormValueMapper {
        return this.objectFormValueMapper;
    }

    public applyRuleResult(ruleResult: RuleResult): void {
        if (typeof ruleResult.InputOrder !== 'undefined') {
            this.objectFormValueMapper?.setFieldOrder(ruleResult.InputOrder);
        }

        this.objectFormValueMapper?.applyPropertyInstructions(ruleResult);
    }

    public async commit(): Promise<string | number> {

        this.objectFormValidator.enabled = true;
        const valid = await this.objectFormValidator.validateForm();
        if (!valid) {
            const validationResults = this.objectFormValueMapper.getValidationResults();
            console.debug('ValidationResults:');
            for (const vr of validationResults) {
                console.debug(vr.message);
            }

            const errorMessage = await TranslationService.translate('Translatable#Form contains invalid values');
            throw new Error('0', errorMessage);
        }

        let id: string | number;

        // do nothing
        const commitHandler = ObjectFormRegistry.getInstance().createObjectCommitHandler(this.objectFormValueMapper);
        if (commitHandler) {
            id = await commitHandler.commitObject()
                .catch(async (error: Error) => {
                    const content = new ComponentContent('list-with-title',
                        {
                            title: 'Translatable#Error on create:',
                            list: [`${error.Code}: ${error.Message}`]
                        }
                    );
                    OverlayService.getInstance().openOverlay(
                        OverlayType.WARNING, null, content, 'Translatable#Error!', null, true
                    );
                    throw error;
                });
        } else {
            console.error(`No object commit handler for type: ${this.objectFormValueMapper?.object?.KIXObjectType}`);
        }

        return id;
    }

    public enableValidation(): void {
        this.objectFormValidator.enabled = true;
    }

    public disableValidation(): void {
        this.objectFormValidator.enabled = false;
    }
}