/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CKEditorConfiguration } from '../../modules/base-components/model/CKEditorConfiguration';
import { KIXObjectType } from '../kix/KIXObjectType';
import { IConfiguration } from './IConfiguration';

export class DefaultColorConfiguration implements IConfiguration {

    public static CONFIGURATION_ID = 'default-color-configuration';

    public application: string = 'agent-portal';

    public constructor(
        public id: string = DefaultColorConfiguration.CONFIGURATION_ID,
        public name: string = 'Default Colors Configuration',
        public type: string = 'Default Color',
        public valid: boolean = true,
        public defaultColors: string[] = [
            '#EC9073', '#6BAD54', '#E2F626', '#0F22E4', '#1FE362', '#C5F566', '#8D23A8',
            '#78A7FC', '#DFC01B', '#43B261', '#53758D', '#C1AE45', '#6CD13D', '#E0CA0E',
            '#652188', '#3EBB34', '#8F53EA', '#956669', '#34A0FB', '#F50178', '#AB766A',
            '#BEA029', '#ABE124', '#A68477', '#F7D084', '#93F0A5', '#B54667', '#F12D25',
            '#1DBA13', '#21AF23', '#3B62C0', '#876CDC', '#3DE6A0', '#CCD77F', '#B91583',
            '#8CFFFB', '#073641', '#38E1E9', '#1A5F2D', '#ED603F', '#3BB3AA', '#FA2216',
            '#34E25C', '#B6716A', '#E5845B', '#497FC2', '#ABCCEE', '#222047', '#DFE514',
            '#FFA84F', '#388B85', '#D21AEF', '#811A26', '#206057', '#557FDB', '#F148CC',
            '#DAFF4E', '#FCF072', '#792DA8', '#50DC0B', '#8FDC7A', '#954958', '#74575C',
            '#AC5CAF', '#4FF2BF', '#E4FC17', '#6ADB42', '#4B693B', '#5D7BA1', '#BF1B1C',
            '#A00AC1', '#13CEE0', '#02C7C0', '#21EAD8', '#C87D39', '#AEAB86', '#DA9998',
            '#AAB717', '#8496E6', '#FAE782', '#120BD9', '#1A3B4C', '#3F7E68', '#6FCF6B',
            '#5564DE', '#6E07AD', '#0C847C', '#1BB8A2', '#101DF8', '#85DE9B', '#D0AD74',
            '#B803D8', '#0E3C7E', '#E8E05E', '#8E36DD', '#2ADC85', '#13E17B', '#A8AE41',
            '#C3AA40', '#9CFD3C', '#A5782F', '#E33C5B', '#8F33D8', '#59BF4F', '#FECFB0',
            '#B553D8', '#2CB590', '#01045E', '#CA78AC', '#8AA596', '#54BB79', '#3A5E0E',
            '#F10F55', '#D205AA', '#234D8D', '#3D2F8A', '#9B4F95', '#E96E9C', '#47E4C9',
            '#FFC3D4', '#11231A', '#DA529F', '#789D72', '#AB9906', '#205F33', '#444685',
            '#05067A', '#6E2FC9', '#165AF5', '#026619', '#96EEC6', '#4DB433', '#E9219F',
            '#AA5F55', '#558BCA', '#56034C', '#A896DD', '#9C7CD0', '#B8B170', '#7D6F92',
            '#9E8A2D', '#7D6134', '#ED069E', '#74625E', '#3DC9C5', '#C64507', '#274987',
            '#D74EEE', '#C53379', '#1A6E42', '#308859', '#F70419', '#BE10CF', '#E841CC',
            '#AD60CB', '#30BB80', '#5886C9'
        ]
    ) { }

}
