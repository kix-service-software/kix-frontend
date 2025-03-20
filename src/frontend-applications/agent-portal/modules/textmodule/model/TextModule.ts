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


export class TextModule extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.TEXT_MODULE;

    public ID: number;

    public Name: string;

    public Text: string;

    public Keywords: string[];

    public Comment: string;

    public Subject: string;

    public Language: string;

    public keywordsDisplayString: string;

    public QueueIDs: number[];

    public TicketTypeIDs: number[];

    public equals(textModule: TextModule): boolean {
        return this.ID === textModule.ID;
    }

    public constructor(textModule?: TextModule) {
        super(textModule);
        if (textModule) {
            this.ObjectId = textModule.ID;
            this.keywordsDisplayString = this.Keywords?.join(', ');
        }
    }

}
