import {UploadedFile} from "express-fileupload";
const { promisify } = require("util");

/**
 * Node's file utils wrapped as promises:
 */
export class FileUtils {

    private static fs = require("fs");

    private static unlink = promisify(FileUtils.fs.unlink);

    /**
     * Move the uploaded file into specific path on the local system.
     * @param {fileUpload.UploadedFile} uploadedFile the uploaded file
     * @param {string} to the destination path
     * @returns {Promise<void>}
     */
    static async move(uploadedFile: UploadedFile, to: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            uploadedFile.mv(to, (err) => {
                if (err) reject();
                else resolve();
            })
        })
    }

    /**
     * Deletes the specified file
     * @param {string} path the path to the file.
     * @returns {Promise<void>}
     */
    static async delete(path: string): Promise<void> {
        return FileUtils.unlink(path)
    }


    /**
     * Reads the entire content of a file into Node's Buffer
     * @param {string} path the path to the file.
     * @returns {Promise<Buffer>}
     */
    static async read(path: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            FileUtils.fs.readFile(path, {encoding: 'utf8'}, (err, data)=> {
                if (err) reject();
                else resolve(data);
            })
        });
    }
}