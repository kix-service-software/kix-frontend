/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { InputDefinition } from './InputDefinition';

export class AttributeDefinition {

    public Key: string;

    public Name: string;

    public Input: InputDefinition;

    public Searchable: boolean;

    public Sub: AttributeDefinition[];

    public CountMin: number;

    public CountMax: number;

    public CountDefault: number;

    public constructor(definition: AttributeDefinition) {
        if (definition) {
            this.Key = definition.Key;
            this.Name = definition.Name;
            this.Input = definition.Input;
            this.Searchable = definition.Searchable;
            this.CountMin = definition.CountMin;
            this.CountMax = definition.CountMax;
            this.CountDefault = definition.CountDefault;
            this.Sub = definition.Sub ? definition.Sub.map((s) => new AttributeDefinition(s)) : null;
        }
    }

}
