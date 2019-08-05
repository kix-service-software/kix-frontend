/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelComponentState } from './LabelComponentState';
import { Label } from '../../../core/browser/components';
import { SortUtil } from '../../../core/model';

class LabelListComponent {

    private state: LabelComponentState;

    public onCreate(): void {
        this.state = new LabelComponentState();
    }

    public onInput(input: LabelComponentState): void {
        this.state.removeLabels = typeof input.removeLabels !== 'undefined' ? input.removeLabels : true;
        if (input.labels) {
            this.state.labels = input.labels.sort(
                (a, b) => {
                    if (a.object && b.object) {
                        return SortUtil.compareString(a.object.KIXObjectType, b.object.KIXObjectType);
                    }
                    return 0;
                }
            );
        }
    }

    public removeLabel(label: Label): void {
        (this as any).emit('removeLabel', label);
    }
}

module.exports = LabelListComponent;
