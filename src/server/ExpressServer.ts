import fileUpload = require("express-fileupload");

/**
 * Wrapping express and all of our middlewares
 * into a singleton
 */
export namespace ExpressServer {

    const express = require('express');
    const errorHandler = require('errorhandler');
    const app = express();

    app.use(fileUpload());
    app.use(errorHandler());

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

    /**
     * Starts the server and binding it to the specified port.
     * @param {number} port the port to listen to incoming traffic.
     * @returns {Promise<void>}
     */
    export function start(port: number): Promise<void> {
        return new Promise<void>(_resolve => {
            app.listen(port, _resolve)
        });
    }
}