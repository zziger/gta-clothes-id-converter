import {CascaderOptionType} from "antd/lib/cascader";

export const components = [
    {
        value: 'components',
        label: 'Clothes',
        children: [
            {
                value: '0',
                label: '0 - Head (HEAD)',
            },
            {
                value: '1',
                label: '1 - Masks (BERD)',
            },
            {
                value: '2',
                label: '2 - Hair (HAIR)',
            },
            {
                value: '3',
                label: '3 - Torsos (UPPR)',
            },
            {
                value: '4',
                label: '4 - Pants (LOWR)',
            },
            {
                value: '5',
                label: '5 - Bags and parachutes (HAND)',
            },
            {
                value: '6',
                label: '6 - Shoes (FEET)',
            },
            {
                value: '7',
                label: '7 - Accessories (TEEF)',
            },
            {
                value: '8',
                label: '8 - Shirts (ACCS)',
            },
            {
                value: '9',
                label: '9 - Armors (TASK)',
            },
            {
                value: '10',
                label: '10 - Decals (DECL)',
            },
            {
                value: '11',
                label: '11 - Tops (JBIB)',
            },
        ],
    },
    {
        value: 'props',
        label: 'Props',
        children: [
            {
                value: '0',
                label: '0 - Head (HEAD)',
            },
            {
                value: '1',
                label: '1 - Eyes (EYES)',
            },
            {
                value: '2',
                label: '2 - Ears (EARS)',
            },
            {
                value: '3',
                label: '3 - Mouth (MOUTH)',
            },
            {
                value: '4',
                label: '4 - Left hand (LEFT_HAND)',
            },
            {
                value: '5',
                label: '5 - Right hand (RIGHT_HAND)',
            },
            {
                value: '6',
                label: '6 - Left wrist (LEFT_WRIST)',
            },
            {
                value: '7',
                label: '7 - Right wrist (RIGHT_WRIST)',
            },
            {
                value: '8',
                label: '8 - Hip (HIP)',
            },
            {
                value: '9',
                label: '9 - Left foot (LEFT_FOOT)',
            },
            {
                value: '10',
                label: '10 - Right foot (RIGHT_FOOT)',
            },
            {
                value: '11',
                label: '11 - ??? (UNK_604819740)',
            },
            {
                value: '12',
                label: '12 - ??? (UNK_2358626934)',
            },
        ],
    },
] as CascaderOptionType[];

export const componentIds: Record<string, number> = {
    head: 0,
    berd: 1,
    hair: 2,
    uppr: 3,
    lowr: 4,
    hand: 5,
    feet: 6,
    teef: 7,
    accs: 8,
    task: 9,
    decl: 10,
    jbib: 11,
    p_head: 0,
    p_eyes: 1,
    p_ears: 2,
    p_mouth: 3,
    p_lhand: 4,
    p_rhand: 5,
    p_lwrist: 6,
    p_rwrist: 7,
    p_hip: 8,
    p_lfoot: 9,
    p_rfoot: 10
}