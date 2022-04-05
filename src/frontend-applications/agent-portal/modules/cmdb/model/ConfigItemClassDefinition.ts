/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AttributeDefinition } from './AttributeDefinition';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class ConfigItemClassDefinition extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION;

    public ObjectId: string | number;

    public ClassID: number;

    public Version: number;

    public CreateBy: number;

    public CreateTime: string;

    public Definition: AttributeDefinition[];

    public Class: string;

    public DefinitionID: number;

    public DefinitionString: string;

    public isCurrentDefinition: boolean;

    public constructor(configItemClassDefintion: ConfigItemClassDefinition) {
        super();
        if (configItemClassDefintion) {
            this.DefinitionID = configItemClassDefintion.DefinitionID;
            this.ObjectId = this.DefinitionID;
            this.Class = configItemClassDefintion.Class;
            this.ClassID = configItemClassDefintion.ClassID;
            this.Version = configItemClassDefintion.Version;
            this.CreateBy = configItemClassDefintion.CreateBy;
            this.CreateTime = configItemClassDefintion.CreateTime;
            this.Definition = configItemClassDefintion.Definition;
            this.DefinitionString = configItemClassDefintion.DefinitionString;
            this.isCurrentDefinition = configItemClassDefintion.isCurrentDefinition;
        }
    }

    public equals(configItemClassDefintion: ConfigItemClassDefinition): boolean {
        return this.DefinitionID === configItemClassDefintion.DefinitionID;
    }

    public getIdPropertyName(): string {
        return 'DefinitionID';
    }

}
