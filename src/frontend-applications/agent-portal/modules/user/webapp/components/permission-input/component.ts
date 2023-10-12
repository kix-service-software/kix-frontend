/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { CheckboxOption } from './CheckboxOption';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { PermissionFormData } from '../../../../base-components/webapp/core/PermissionFormData';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { PermissionProperty } from '../../../model/PermissionProperty';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';

class Component extends AbstractMarkoComponent {

    public state: ComponentState;

    public async onCreate(input: any): Promise<void> {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.update(input);

        return input;
    }

    private async update(input): Promise<void> {
        await this.setCheckboxOptions(input);
        this.prepareTitles();
        if (input.value && typeof input.value !== 'undefined' && input.value instanceof PermissionFormData) {
            this.state.checkboxOptions.forEach((co) => {
                if (typeof input.value[co.id] === 'boolean') {
                    co.checked = input.value[co.id];
                }
            });
            this.state.comment = input.value.Comment;
            (this as any).setStateDirty('checkboxOptions');
        } else {
            this.state.comment = '';
        }
    }

    public async onMount(): Promise<void> {
        this.state.commentPlaceholder = await TranslationService.translate('Translatable#Comment');
    }

    private async setCheckboxOptions(input: any): Promise<void> {
        this.state.checkboxOptions = [
            new CheckboxOption(PermissionProperty.CREATE),
            new CheckboxOption(PermissionProperty.READ),
            new CheckboxOption(PermissionProperty.UPDATE),
            new CheckboxOption(PermissionProperty.DELETE),
            new CheckboxOption(PermissionProperty.DENY),
        ];
    }

    private async prepareTitles(): Promise<void> {
        for (const option of this.state.checkboxOptions) {
            const title = await LabelService.getInstance().getPropertyText(
                option.id, KIXObjectType.PERMISSION, false, false
            );
            this.state.titles.set(option.id, title || option.id);
        }
        (this as any).setStateDirty('titles');
    }

    public checkboxClicked(id: string): void {
        const option = this.state.checkboxOptions.find((o) => o.id === id);
        if (option) {
            option.checked = !option.checked;
        }
        this.emitChanges();
    }

    public commentchanged(event: any): void {
        this.state.comment = event && event.target ? event.target.value : this.state.comment;
        this.emitChanges();
    }

    private emitChanges(): void {
        const permissiondata: PermissionFormData = new PermissionFormData();
        this.state.checkboxOptions.forEach((co) => permissiondata[co.id] = co.checked);
        permissiondata.Comment = this.state.comment;

        (this as any).emit('change', permissiondata);
    }
}

module.exports = Component;
