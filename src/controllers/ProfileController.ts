import { Request, Response } from "express";
import { ProfileRepo } from "../repository/ProfileRepo";
import { Respond } from "../lib/Respond";

export class ProfileController {
    private profileRepo = new ProfileRepo()
    private respond = new Respond()

    getProfile = (req: Request, res: Response) => {
        this.profileRepo.getProfile(req, res)
            .then(result => {
                return this.respond.send(res, result)
            })
    }

    updateProfile = (req: Request, res: Response) => {
        this.profileRepo.updateProfile(req, res)
            .then(result => {
                return this.respond.send(res, result)
            })
    }
}