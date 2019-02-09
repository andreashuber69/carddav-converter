import { readFile } from "fs";

export interface IAddress {
    readonly First?: string;
    readonly Last?: string;
    readonly Email?: string;
    readonly Category?: string;
    readonly Home?: string;
    readonly Work?: string;
    readonly Mobile?: string;
    readonly "Alternate Email 1"?: string;
    readonly "Alternate Email 2"?: string;
    readonly "Home Address"?: string;
    [key: string]: string | undefined;
}

export class AddressParser {
    public static async parse(path: string): Promise<IAddress[]> {
        const content = await this.readFile(path);
        const lines = content.split(/\r\n|\r|\n/);

        if (lines.length < 2) {
            return [];
        }

        const identifiers = lines[0].split(",");
        const result: IAddress[] = [];

        for (let lineIndex = 1; lineIndex < lines.length; ++lineIndex) {
            const address = AddressParser.createAddress(lines[lineIndex].split(","), identifiers, result);

            if (address) {
                result.push(address);
            }
        }

        return result;
    }

    private static createAddress(values: string[], identifiers: string[], result: IAddress[]) {
        if (values.length !== identifiers.length) {
            return undefined;
        }

        const address: IAddress = {};

        for (let valueIndex = 0; valueIndex < values.length; ++valueIndex) {
            address[identifiers[valueIndex]] = values[valueIndex];
        }

        return address;
    }

    private static readFile(path: string) {
        return new Promise<string>((resolve, reject) => {
            readFile(path, (err, data) => err ? reject(err) : resolve(data.toString()));
        });
    }
}
