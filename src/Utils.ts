import {useState} from "react";

export namespace Utils {
    export function hash(key: string): number {
        let keyLowered = key.toLowerCase();
        let length = keyLowered.length;
        let hash, i;
        for (hash = i = 0; i < length; i++) {
            hash += keyLowered.charCodeAt(i);
            hash += (hash << 10);
            hash ^= (hash >>> 6)
        }

        return hash >>> 0;
    }

    export function cloneObject<T extends Record<any, any>>(obj: T): T {
        const clone: any = {};
        for (const i in obj) {
            if (typeof (obj[i]) == "object" && obj[i] != null)
                clone[i] = cloneObject(obj[i]);
            else
                clone[i] = obj[i];
        }
        return clone;
    }

    export function sumObjects<T extends Record<any, number>>(...sources: T[]): T {
        const result: any = {};
        for (let source of sources) {
            for (let sourceKey in source) {
                if (!(sourceKey in result)) result[sourceKey] = 0;
                result[sourceKey] += source[sourceKey];
            }
        }

        return result;
    }

    export function toObject<T, K extends string | number>(array: T[], keyGetter: (e: T) => K): Record<K, T> {
        return Object.fromEntries(array.map(e => [keyGetter(e), e])) as Record<K, T>;
    }

    export interface RichFile extends File {
        filePath: string;
    }

    export async function getDragFiles(dataTransferItems: DataTransferItem[]): Promise<RichFile[]> {

        const readFile = (entry: FileSystemFileEntry, path = '') => {
            return new Promise((resolve, reject) => {
                entry.file(file => {
                    (file as RichFile).filePath = path + file.name // save full path
                    resolve(file)
                }, (err) => {
                    reject(err)
                })
            })
        }

        const dirReadEntries = (dirReader: FileSystemDirectoryReader, path: string) => {
            return new Promise((resolve, reject) => {
                dirReader.readEntries(async entries => {
                    let files: any[] = [];
                    for (let entry of entries) {
                        const itemFiles = await getFilesFromEntry(entry, path)
                        files = files.concat(itemFiles)
                    }
                    resolve(files)
                }, (err) => {
                    reject(err)
                })
            })
        }

        const readDir = async (entry: FileSystemDirectoryEntry, path: string) => {
            const dirReader = entry.createReader()
            const newPath = path + entry.name + '/'
            let files: any[] = [];
            let newFiles: any;
            do {
                newFiles = await dirReadEntries(dirReader, newPath)
                files = files.concat(newFiles)
            } while (newFiles.length > 0)
            return files
        }

        const getFilesFromEntry = async (entry: FileSystemEntry, path = '') => {
            if (entry.isFile) {
                const file = await readFile(entry as FileSystemFileEntry, path)
                return [file]
            }
            if (entry.isDirectory) {
                return await readDir(entry as FileSystemDirectoryEntry, path)
            }
        }

        let files: any[] = []
        let entries: any[] = []

        // Pull out all entries before reading them
        for (let i = 0, ii = dataTransferItems.length; i < ii; i++) {
            console.log(dataTransferItems[i]);
            entries.push(dataTransferItems[i].webkitGetAsEntry())
        }

        // Recursively read through all entries
        for (let entry of entries) {
            const newFiles = await getFilesFromEntry(entry)
            files = files.concat(newFiles)
        }

        return files
    }

    export function downloadTextFile(text: string, name: string) {
        const a = document.createElement('a');
        const type = name.split(".").pop();
        a.href = URL.createObjectURL(new Blob([text], {type: `text/${type === "txt" ? "plain" : type}`}));
        a.download = name;
        a.click();
    }

    export function useForceUpdate(){
        const [value, setValue] = useState(0);
        return () => setValue(value => value + 1);
    }
}
