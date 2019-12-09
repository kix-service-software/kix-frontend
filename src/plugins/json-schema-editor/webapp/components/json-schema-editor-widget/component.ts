/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import {
    AbstractMarkoComponent
} from '../../../../../frontend-applications/agent-portal/modules/base-components/webapp/core/AbstractMarkoComponent';
import {
    DialogService
} from '../../../../../frontend-applications/agent-portal/modules/base-components/webapp/core/DialogService';
import {
    TranslationService
} from '../../../../../frontend-applications/agent-portal/modules/translation/webapp/core/TranslationService';

declare var JSONEditor: any;

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);

        setTimeout(() => this.prepareEditor(), 50);
    }

    // tslint:disable:max-line-length
    private prepareEditor(): void {
        const schema = {
            $schema: "http://json-schema.org/draft-03/schema#",
            type: "object",
            properties: {
                ValueTTL: {
                    title: "TTL",
                    description: "Field value cleared after ValueTTL seconds after the field value is set.",
                    type: "string",
                    required: true
                },
                CountMin: {
                    title: "Count Min",
                    description: "The minimum number of items which are available for input if field is shown in edit mode.",
                    type: "number",
                    required: true
                },
                CountMax: {
                    title: "Count Max",
                    description: "The maximum number of array or selectable items for this field. if field is shown in edit mode.",
                    type: "number",
                    required: true
                },
                CountDefault: {
                    title: "Count Default",
                    description: "If field is shown for display and no value is set, CountDefault numbers of inputs are displayed.",
                    type: "number",
                    required: true
                },
                ItemSeparator: {
                    title: "Count Default",
                    description: "If field contains multiple values, single values are concatenated by this separator symbol/s.",
                    type: "string",
                    required: false
                },
                DefaultValue: {
                    title: "Default Value",
                    description: "The initial value of the field if shown in edit mode for the first time. Applies to first item of array only.",
                    type: "string",
                    required: false
                },
                Link: {
                    title: "Link",
                    description: "An URL which may use placedholder referring to this fields value (or any other object property) as parameter, i.e. https://localhost/Field.Value.",
                    type: "string",
                    required: false
                },
                RegExList: {
                    title: "RegEx List",
                    description: "A list of RegEx which are applied to values entered before submitting if field is shown in edit mode. The RegExError is shown if a RegEx does NOT match the value entered.",
                    type: "array",
                    required: false,
                    items: {
                        type: "string"
                    }
                }
            }
        };

        const element = document.getElementById(this.state.editorId);
        if (element) {
            const editor = new JSONEditor(element, { schema });
        }
    }

    public async cancel(): Promise<void> {
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        return;
    }

}

module.exports = Component;
