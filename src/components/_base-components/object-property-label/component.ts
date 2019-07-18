/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ObjectPropertyLabelInput } from './ObjectPropertyLabelInput';
import { ObjectIcon } from '../../../core/model';
import { ILabelProvider } from '../../../core/browser';

export class ObjectPropertyLabelComponent<T> {

    private state: ComponentState<T>;

    private object: any;
    private property: string;
    private labelProvider: ILabelProvider<any>;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ObjectPropertyLabelInput<T>): void {
        this.object = input.object;
        this.property = input.property;
        this.labelProvider = input.labelProvider;
        this.state.hasText = typeof input.showText !== 'undefined' ? input.showText : true;
    }

    public onMount(): void {
        if (this.object) {
            this.prepareDisplayText();
            this.preparePropertyName();
        }
    }

    private async prepareDisplayText(): Promise<void> {
        this.state.propertyDisplayText = await this.getPropertyDisplayText();
        this.state.propertyIcon = await this.getIcon();
    }

    private async preparePropertyName(): Promise<void> {
        let name = this.property;
        if (this.labelProvider) {
            name = await this.labelProvider.getPropertyText(this.property);
        }
        this.state.propertyName = name;
    }

    private async getIcon(): Promise<string | ObjectIcon> {
        const icons = await this.labelProvider.getIcons(this.object, this.property);
        let icon = null;
        if (icons && icons.length) {
            icon = icons[0];
        }
        return icon;
    }

    private async getPropertyDisplayText(): Promise<string> {
        let value = this.property;
        if (this.labelProvider && this.object) {
            value = await this.labelProvider.getDisplayText(this.object, this.property);
        }
        return value;
    }

    public getValueClasses(): string {
        let classes = [];
        if (this.labelProvider) {
            classes = this.labelProvider.getDisplayTextClasses(this.object, this.property);
        }
        return classes.join(',');
    }

}

module.exports = ObjectPropertyLabelComponent;
