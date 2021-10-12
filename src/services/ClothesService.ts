import clothesMap from '../clothesdlcmap.json';
import {Utils} from "../Utils";
import * as Util from "util";
import RichFile = Utils.RichFile;
import * as xml from "xml2js";
import {componentIds} from "../components";


export interface ClothesMapDlc {
    components: Record<number, number>;
    props: Record<number, number>;
    dlcName: string;
}

export interface ClothesMap {
    male: Record<string, ClothesMapDlc>;
    female: Record<string, ClothesMapDlc>;
}

export interface CustomClothesMap {
    male?: ClothesMapDlc;
    female?: ClothesMapDlc;
    name: string;
}

const customClothesName = 'custom_clothes';

function combinePaths(a: string, b: string): string {
    return a + '/' + b.replace(/\\/g, '/').replace(/^\/|\/$/g, '');
}

export default class ClothesService {
    static instance = new ClothesService();

    private constructor() {
        this.restoreCustomDlcs();
        this.updateData();
    }


    private updateData() {
        this.saveCustomDlcs();

        const data = Utils.cloneObject(clothesMap) as ClothesMap;

        if (!this.customDlcs.length) {
            this.data = data;
            return;
        }

        for (const gender of Object.keys(data)) {
            const obj = data[gender as keyof typeof data];
            let last = obj[customClothesName];
            delete obj[customClothesName];


            for (let customDlc of this.customDlcs) {
                if (!(gender in customDlc)) continue;
                const dlc = customDlc[gender as keyof typeof data]!;

                console.log(dlc.dlcName);

                obj[dlc.dlcName] = {
                    ...last,
                    dlcName: dlc.dlcName
                };

                last = {
                    dlcName: '',
                    props: Utils.sumObjects(last.props, dlc.props),
                    components: Utils.sumObjects(last.components, dlc.components)
                };
            }

            console.log('---');

            obj['INVALID'] = {
                ...last,
                dlcName: null!
            };
        }

        this.data = data;
    }

    getRelativeDrawable(gender: 'male' | 'female', type: 'props' | 'components', component: number, drawable: number): [drawable: number, dlc: string] | null {
        const data = Object.values(this.data[gender]).reverse();
        for (let index in data) {
            const obj = data[index];

            if (obj[type][component] <= drawable) {
                return [
                    drawable - obj[type][component],
                    obj.dlcName
                ];
            }
        }

        return null;
    }

    addCustomDlcs(dlcs: CustomClothesMap[]) {
        this.customDlcs = this.customDlcs.filter(d => !dlcs.some(dl => dl.name === d.name));
        this.customDlcs.push(...dlcs);
        this.updateData();
    }

    setCustomDlcs(dlcs: CustomClothesMap[]) {
        this.customDlcs = dlcs;
        this.updateData();
    }

    removeCustomDlc(index: number) {
        this.customDlcs.splice(index, 1);
        this.updateData()
    }

    moveCustomDlc(index: number, up: boolean) {
        const mod = up ? -1 : 1;
        if (!(index in this.customDlcs) || !((index + mod) in this.customDlcs)) return;
        [this.customDlcs[index], this.customDlcs[index + mod]] = [this.customDlcs[index + mod], this.customDlcs[index]];
        this.updateData()
    }

    saveCustomDlcs() {
        localStorage.setItem('customDlcs', JSON.stringify(this.customDlcs));
    }

    restoreCustomDlcs() {
        if (!("customDlcs" in localStorage)) return;
        try {
            this.customDlcs = JSON.parse(localStorage.getItem("customDlcs")!);
        } catch(e) {
            console.error(e);
            localStorage.removeItem("customDlcs");
        }
    }

    async addFromFiles(files: RichFile[], replace = false) {
        const filesObj = Utils.toObject(files, e => e.filePath);
        const maps: CustomClothesMap[] = [];

        for (let file of files) {
            if (file.name !== "resource.cfg") continue;
            file.filePath = file.filePath.replace(/\\/g, '/');
            const path = file.filePath.split(/[/\\]/g);
            const resourcePath = file.filePath.replace(/[/\\]resource.cfg[/\\]?$/, '');

            if (path.length < 2) {
                console.error('Found an resource.cfg, but it wasn\'t in a folder, skipping.');
                continue;
            }
            const resourceName = path[path.length - 2];

            console.log('Checking ' + resourceName);

            const resourceCfg = await file.text();
            const type = resourceCfg.match(/type:\s+['"]?(.*?)['"]?(?:,|[\r\n]+|$)/)?.[1];
            const streamPath = resourceCfg.match(/main:\s+['"]?(.*?)['"]?(?:,|[\r\n]+|$)/)?.[1];

            if (type !== 'dlc') {
                console.error('Resource ' + resourceName + ' is not a dlc');
                continue;
            }

            if (!streamPath) {
                console.error('Can\'t find a path to stream.cfg');
                continue;
            }

            const streamCfgPath = combinePaths(resourcePath, streamPath);
            if (!(streamCfgPath in filesObj)) {
                console.error('Can\'t find stream.cfg');
                continue;
            }

            const streamCfg = await filesObj[streamCfgPath].text();
            const metaData = streamCfg.match(/meta:\s+{[\r\n](.*?)}/s)?.[1]?.trim();
            if (!metaData) {
                console.error('Invalid meta found');
                continue;
            }

            const metaEntries = streamCfg.match(/\s*(.*?):\s+SHOP_PED_APPAREL_META_FILE(?:,|[\r\n]+|$)/g)
                ?.map(e => e.match(/\s*(.*?):\s+SHOP_PED_APPAREL_META_FILE(?:,|[\r\n]+|$)/)?.[1]).filter(Boolean) as string[]; // getting cloth meta paths
            if (!metaEntries?.length) {
                console.error('No clothes found');
                continue;
            }

            const map: CustomClothesMap = {
                name: resourceName
            };

            for (let metaEntry of metaEntries) {
                const metaFilePath = combinePaths(resourcePath, metaEntry);
                if (!(metaFilePath in filesObj)) {
                    console.error('Cant find meta ' + metaFilePath);
                    continue;
                }

                const metaFile = await filesObj[metaFilePath].text();
                const data = await xml.parseStringPromise(metaFile);

                const dlcName = data?.ShopPedApparel?.dlcName[0];
                const fullDlcName = data?.ShopPedApparel?.fullDlcName[0];
                const ped = data?.ShopPedApparel?.pedName[0];
                if (!dlcName || !fullDlcName || !ped) {
                    console.error("Invalid meta " + metaEntry);
                    continue;
                }

                if (ped !== 'mp_m_freemode_01' && ped !== 'mp_f_freemode_01') {
                    console.error(metaFilePath + ' is not for MP ped');
                    continue;
                }

                const gender = ped === 'mp_m_freemode_01' ? 'male' : 'female';

                if (gender in map) {
                    console.error('More than 1 ' + ped + ' ped was found. It\'s not supported');
                    continue;
                }

                const dlc: ClothesMapDlc = {
                    dlcName,
                    props: {},
                    components: {}
                };

                for (let file of files) {
                    if (!file.filePath.includes(fullDlcName) || !file.name.endsWith('.ydd')) continue;
                    const match = file.name.match(/^(\w+)_(\d+)/);
                    const type = match?.[1];
                    const id = +(match?.[2] ?? NaN) + 1;
                    if (!type || isNaN(id)) continue;
                    const componentId = componentIds[type];
                    if (!componentId) continue;
                    if (type.startsWith('p_')) {
                        if (dlc.props[componentId] && dlc.props[componentId] > id) continue;
                        dlc.props[componentId] = id;
                    } else {
                        if (dlc.components[componentId] && dlc.components[componentId] > id) continue;
                        dlc.components[componentId] = id;
                    }
                }

                map[gender] = dlc;
            }

            if (!Object.keys(map).length) {
                console.error('Didn\'t find any MP clothes. Skipping.');
                continue;
            }

            maps.push(map);
        }

        if (replace) this.setCustomDlcs(maps);
        else this.addCustomDlcs(maps);
    }

    public customDlcs: CustomClothesMap[] = [];
    private data!: ClothesMap;
}