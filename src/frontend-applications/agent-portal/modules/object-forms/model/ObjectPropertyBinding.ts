/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../model/IdService';

export class ObjectPropertyBinding {

    public id: string;
    private elementBindings = [];
    private value: any;

    public constructor(private object: any, public property: string) {
        this.id = IdService.generateDateBasedId('ObjectPropertyBinding');
        this.value = object[property];

        Object.defineProperty(this.object, this.property, {
            get: this.valueGetter.bind(this),
            set: this.valueSetter.bind(this)
        });
    }

    private valueGetter(): any {
        return this.value;
    }

    private valueSetter(val: any): void {
        this.value = val;
        for (const binding of this.elementBindings) {
            if (binding.cb) {
                binding.cb(val);
            }
        }
    }

    public addBinding(cb: (value: any) => void): string {
        const binding = {
            id: IdService.generateDateBasedId(),
            cb
        };
        this.elementBindings.push(binding);

        return binding.id;
    }

    public removeBindings(bindingIds: string[]): void {
        for (const id of bindingIds) {
            const index = this.elementBindings.findIndex((b) => b.id === id);
            if (index !== -1) {
                this.elementBindings.splice(index, 1);
            }
        }
    }

}