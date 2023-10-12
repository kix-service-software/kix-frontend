/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectPropertyBinding } from '../modules/object-forms/model/ObjectPropertyBinding';

export class BindableObject {

    protected propertyBindings: ObjectPropertyBinding[] = [];

    public constructor() { }

    public addBinding(property: string, cb: (value: any) => void): string {

        let propertyBinding = this.propertyBindings.find((b) => b.property === property);
        if (!propertyBinding) {
            propertyBinding = new ObjectPropertyBinding(this, property);
            this.propertyBindings.push(propertyBinding);
        }

        return propertyBinding.addBinding(cb);
    }

    public removeBindings(bindingIds: string[]): void {
        if (Array.isArray(this.propertyBindings)) {
            for (const binding of this.propertyBindings) {
                binding.removeBindings(bindingIds);
            }
        }
    }
}