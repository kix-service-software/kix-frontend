/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { SysConfigOptionProperty } from './SysConfigOptionProperty';

export class SysConfigOption extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.SYS_CONFIG_OPTION;

    public Name: string;

    public Value: any;

    public Context: string;

    public ContextMetadata: string;

    public ReadOnly: boolean;

    public constructor(sysConfigOption?: SysConfigOption) {
        super();
        if (sysConfigOption) {
            this.Name = sysConfigOption.Name;
            this.ObjectId = this.Name;
            this.Value = sysConfigOption.Value;
            this.Context = sysConfigOption.Context;
            this.ContextMetadata = sysConfigOption.ContextMetadata;
            this.ReadOnly = Boolean(sysConfigOption.ReadOnly);
            this.displayValues = [
                [SysConfigOptionProperty.NAME, this.Name],
                [SysConfigOptionProperty.CONTEXT, this.Context],
                [SysConfigOptionProperty.CONTEXT_METADATA, this.ContextMetadata],
            ];
        }
    }

    public equals(object: SysConfigOption): boolean {
        return object.Name === this.Name;
    }

}
