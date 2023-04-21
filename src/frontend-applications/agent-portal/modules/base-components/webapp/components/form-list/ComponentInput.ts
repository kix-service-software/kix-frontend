/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputAction } from '../../../../../modules/base-components/webapp/core/FormInputAction';
import { AutoCompleteConfiguration } from '../../../../../model/configuration/AutoCompleteConfiguration';
import { TreeNode } from '../../core/tree';

export class ComponentInput {

    public disabled: boolean;

    public actions: FormInputAction[];

    public readonly: boolean;

    public invalid: boolean;

    public freeText: boolean;

    public multiselect: boolean;

    public autoCompleteConfiguration: AutoCompleteConfiguration;

    public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]>;

    public removeNode: boolean;

    public loadNodes: () => Promise<TreeNode[]>;

    public treeId: string;

    public canRemoveNode: boolean;

}
