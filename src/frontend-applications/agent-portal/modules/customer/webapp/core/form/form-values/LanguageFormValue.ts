/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TreeNode } from '../../../../../base-components/webapp/core/tree';
import { FormValueProperty } from '../../../../../object-forms/model/FormValueProperty';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { UserPreference } from '../../../../../user/model/UserPreference';

export class LanguageFormValue extends SelectObjectFormValue {

    public constructor(
        property: string,
        preference: UserPreference,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, preference, objectValueMapper, parent);
        this.maxSelectCount = 1;
        this.label = 'Language';
        this.setNewInitialState(FormValueProperty.VISIBLE, true);
    }

    public async loadSelectableValues(): Promise<void> {
        const languages = await TranslationService.getInstance().getLanguages();
        const nodes = [];
        for (const lang of languages) {
            const language = await TranslationService.translate(lang[1]);
            nodes.push(new TreeNode(lang[0], language));
        }

        this.treeHandler?.setTree(nodes, null, true, true);
    }

}