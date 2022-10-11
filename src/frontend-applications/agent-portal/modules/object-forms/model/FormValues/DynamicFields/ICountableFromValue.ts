/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';

export interface ICountableFormValue {

    dfName: string;

    dfValues: DynamicFieldValue[];

    canAddValue(instanceId: string): boolean;

    addFormValue(instanceId: string, value: any): Promise<void>;

    canRemoveValue(instanceId: string): boolean;

    removeFormValue(instanceId: string): Promise<void>;

    setDFValue(): void;

}