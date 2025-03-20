/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigItemClassDefinition } from './ConfigItemClassDefinition';
import { ConfigItemStats } from './ConfigItemStats';
import { AttributeDefinition } from './AttributeDefinition';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class ConfigItemClass extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS;

    public ID: number;

    public Name: string;

    public ValidID: number;

    public Comment: string;

    public ChangeTime: string;

    public ChangeBy: number;

    public CreateTime: string;

    public CreateBy: number;

    public Definitions: ConfigItemClassDefinition[];

    public CurrentDefinition: ConfigItemClassDefinition;

    public ConfigItemStats: ConfigItemStats;

    public constructor(configItemClass?: ConfigItemClass) {
        super(configItemClass);
        if (configItemClass) {
            this.ID = configItemClass.ID;
            this.ObjectId = this.ID;
            this.Name = configItemClass.Name;
            this.ValidID = configItemClass.ValidID;
            this.Comment = configItemClass.Comment;
            this.ChangeTime = configItemClass.ChangeTime;
            this.ChangeBy = configItemClass.ChangeBy;
            this.CreateTime = configItemClass.CreateTime;
            this.CreateBy = configItemClass.CreateBy;
            this.CurrentDefinition = configItemClass.CurrentDefinition;

            this.Definitions = configItemClass.Definitions
                ? configItemClass.Definitions.map((d) => new ConfigItemClassDefinition(d))
                : [];

            this.ConfigItemStats = configItemClass.ConfigItemStats;

            if (this.CurrentDefinition && this.CurrentDefinition.Definition) {
                this.CurrentDefinition.Definition = this.CurrentDefinition.Definition.map(
                    (d) => new AttributeDefinition(d)
                );

                const currentDefinition = this.Definitions.find(
                    (v) => v.DefinitionID === this.CurrentDefinition.DefinitionID
                );

                if (currentDefinition) {
                    currentDefinition.isCurrentDefinition = true;
                }
            }
        }
    }

    public equals(configItemClass: ConfigItemClass): boolean {
        return this.ID === configItemClass.ID;
    }

}
