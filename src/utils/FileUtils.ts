import {UploadedFile} from "express-fileupload";
const { promisify } = require("util");

export class FileUtils {

    private static fs = require("fs");

    private static unlink = promisify(FileUtils.fs.unlink);

    static async move(uploadedFile: UploadedFile, to: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            uploadedFile.mv(to, (err) => {
                if (err) reject();
                else resolve();
            })
        })
    }

    static async delete(path: string): Promise<void> {
        return FileUtils.unlink(path)
    }


    static async read(path: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            FileUtils.fs.readFile(path, {encoding: 'utf8'}, (err, data)=> {
                if (err) reject();
                else resolve(data);
            })
        });
    }
}