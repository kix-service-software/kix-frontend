import { ITableCSSHandler, TableValue } from '../../table';
import { SysConfigOptionDefinition } from '../../../model';
import { SysConfigAccessLevel } from '../../../model/kix/sysconfig/SysConfigAccessLevel';

export class SysConfigTableCSSHandler implements ITableCSSHandler<SysConfigOptionDefinition> {

    public async getRowCSSClasses(definition: SysConfigOptionDefinition): Promise<string[]> {
        const classes = [];

        if (definition && definition.AccessLevel === SysConfigAccessLevel.CONFIDENTIAL) {
            classes.push('confidential');
        }

        return classes;
    }

    public async getValueCSSClasses(definition: SysConfigOptionDefinition, value: TableValue): Promise<string[]> {
        return [];
    }

}
