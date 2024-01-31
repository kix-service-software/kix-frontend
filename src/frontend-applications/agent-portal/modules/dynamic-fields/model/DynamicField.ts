/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { DynamicFieldTypes } from './DynamicFieldTypes';

export class DynamicField extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: string = KIXObjectType.DYNAMIC_FIELD;

    public ID: string;

    public DisplayGroupID: number;

    public FieldType: string | DynamicFieldTypes;

    public FieldTypeDisplayName: string;

    public InternalField: number;

    public Label: string;

    public Name: string;

    public ObjectType: string;

    public Config: any;

    public CustomerVisible: boolean;

    public constructor(dynamicField?: DynamicField) {
        super(dynamicField);
        if (dynamicField) {
            this.ID = dynamicField.ID;
            this.ObjectId = this.ID;
            this.DisplayGroupID = dynamicField.DisplayGroupID;
            this.FieldType = dynamicField.FieldType;
            this.FieldTypeDisplayName = dynamicField.FieldTypeDisplayName;
            this.InternalField = Number(dynamicField.InternalField);
            this.Label = dynamicField.Label;
            this.Name = dynamicField.Name;
            this.ObjectType = dynamicField.ObjectType;
            this.Config = dynamicField.Config;
            this.CustomerVisible = Boolean(dynamicField.CustomerVisible);
        }
    }

}
