import fileUpload = require("express-fileupload");

export namespace ExpressServer {

    const express = require('express');
    var errorHandler = require('errorhandler');
    const app = express();

    app.use(fileUpload());

    app.use(errorHandler(/*{ dumpExceptions: true, showStack: true }*/));

    export function get(path: string, func: (request, response) => void) {
        app.get(path, func);
    }

    export function put(path: string, func: (request, response) => void) {
        app.put(path, func);
    }

    export function post(path: string, func: (request, response) => void) {
        app.post(path, func);
    }

    export function del(path: string, func: (request, response) => void) {
        app.delete(path, func);
    }

    export function start(port: number): Promise<void> {

        return new Promise<void>(_resolve => {
            app.listen(port, _resolve)
        });
    }
}