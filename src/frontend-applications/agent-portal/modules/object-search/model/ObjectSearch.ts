/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class ObjectSearch extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.OBJECT_SEARCH;

    public IsSortable: boolean;

    public IsSearchable: boolean;

    // not needed (currently)
    // public ObjectType: string;

    public Operators: string[];

    public Property: string;

    public constructor(objectSearch?: ObjectSearch) {
        super(objectSearch);
        if (objectSearch) {
            this.IsSortable = Boolean(objectSearch.IsSortable);
            this.IsSearchable = Boolean(objectSearch.IsSearchable);
            this.ObjectId = objectSearch.Property;
            // this.ObjectType = objectSearch.ObjectType;
            this.Operators = objectSearch.Operators;
            this.Property = objectSearch.Property;
        }
    }

}
