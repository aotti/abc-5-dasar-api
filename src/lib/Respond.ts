import { Response } from "express";
import { IResponse } from "./types";

export class Respond {

    send(res: Response, result: IResponse) {
        return res.status(result.status).json({
            status: result.status,
            message: result.message,
            data: result.data
        })
    }

    createObject(status: number, message: IResponse['message'], data: any[]) {
        return {
            status: status,
            message: message,
            data: data
        }
    }
}