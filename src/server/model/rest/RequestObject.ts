/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class RequestObject {

    public constructor(parameter?: Array<[string, any]>) {
        if (parameter) {
            parameter.forEach((p) => this.applyProperty(p[0], p[1]));
        }
    }

    protected applyProperty(name: string, value: any): void {
        if (value !== undefined) {
            this[name] = value;
        }
    }

}
