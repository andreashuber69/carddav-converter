import { readFile } from "fs";

export interface IAddress {
    readonly "First Name"?: string;
    readonly "Middle Name"?: string;
    readonly "Last Name"?: string;
    readonly Title?: string;
    readonly "E-mail Address"?: string;
    readonly "E-mail 2 Address"?: string;
    readonly "Home Phone"?: string;
    readonly "Business Phone"?: string;
    readonly "Mobile Phone"?: string;
    readonly "Other Phone"?: string;
    readonly Company?: string;
    readonly "Business Street"?: string;
    readonly "Business City"?: string;
    readonly "Business State"?: string;
    readonly "Business Postal Code"?: string;
    readonly "Business Country/Region"?: string;
    readonly "Home Street"?: string;
    readonly "Home City"?: string;
    readonly "Home State"?: string;
    readonly "Home Postal Code"?: string;
    readonly "Home Country/Region"?: string;
    readonly Notes?: string;
}

interface IWriteableAddress extends IAddress {
    [key: string]: string | undefined;
}

export class AddressParser {
    public static async parse(path: string): Promise<IAddress[]> {
        const content = await AddressParser.readFile(path);
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

        const address: IWriteableAddress = {};

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
