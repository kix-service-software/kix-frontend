/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputAction } from "../../../../../core/browser";
import { TreeNode, AutoCompleteConfiguration } from "../../../../../core/model";

export class ComponentInput {

    public disabled: boolean;

    public actions: FormInputAction[];

    public readonly: boolean;

    public invalid: boolean;

    public autocomplete: boolean;

    public multiselect: boolean;

    public freeText: boolean;

    public nodes: TreeNode[];

    public selectedNodes: TreeNode[];

    public autoCompleteConfiguration: AutoCompleteConfiguration;

    public searchCallback: (limit: number, searchValue: string) => Promise<TreeNode[]>;

    public removeNode: boolean;

}
