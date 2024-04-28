import { Request, Response } from "express";
import { Respond } from "../lib/Respond";
import { RoomRepo } from "../repository/RoomRepo";

export class RoomController {
    private respond = new Respond()
    private roomRepo = new RoomRepo()

    createRoom = (req: Request, res: Response) => {
        this.roomRepo.createRoom(req, res)
            .then(result => {
                return this.respond.send(res, result)
            })
    }

    updateRoom = (req: Request, res: Response) => {
        this.roomRepo.updateRoom(req, res)
            .then(result => {
                return this.respond.send(res, result)
            })
    }

    joinRoom = (req: Request, res: Response) => {
        this.roomRepo.joinRoom(req, res)
            .then(result => {
                return this.respond.send(res, result)
            })
    }
}