import { Respond } from "./Respond";
import { AuthPayloadType, IResponse } from "./types";

export class RepoHelper {
    private respond = new Respond()

    /**
     * 
     * @param action value from client
     * @param authentic 
     * @returns 
     */
    checkReqBody(authentic: AuthPayloadType): [boolean, IResponse | null] {
        // check post action
        if(authentic.authAction !== authentic.clientAction) {
            const message: IResponse = this.respond.createObject(401, 'action is not allowed', [])
            return [true, message]
        }
        // loop the keys 
        for(let key of authentic.payloadKeys) {
            // check the keys
            switch(true) {
                // if the key match, break the switch
                case this.matchPayloadKeys(authentic.clientAction, key):
                    break
                // if the key doesnt match with IRequestInsertWord interface, return error
                default:
                    const message: IResponse = this.respond.createObject(401, `wrong payload property!`, [])
                    return [true, message]
            }
        }
        // return error message
        return [false, null]
    }

    // ~~ side method ~~
    private matchPayloadKeys(authAction: string, key: string) {
        // checking action
        switch(authAction) {
            case 'register player':
                return key === 'id' || key === 'username' ? true : false
            case 'insert words':
                return key === 'category' || key === 'word' ? true : false
            default:
                return false
        }
    }
}