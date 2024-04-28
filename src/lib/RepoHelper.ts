import { Respond } from "./Respond";
import { IAuthClientReq, IRequestCreateRoom, IRequestInsertRound, IRequestInsertWord, IRequestRegisterPlayer, IRequestUpdateRoom, IResponse, repoHelperInputsType } from "./types";

export class RepoHelper {
    private respond = new Respond()

    /**
     * @param action value from client
     * @param authentic object that contains stuff for req.body auth
     * @returns [true, error] if something wrong with the req.body
     */
    checkClientInputs(authentic: IAuthClientReq): repoHelperInputsType {
        // if payload array
        const checkedPayload = Array.isArray(authentic.clientInputs.payload) ? authentic.clientInputs.payload[0] : authentic.clientInputs.payload
        // filtered data
        const { reqMethod, action, payload } = {
            reqMethod: authentic.reqMethod,
            action: authentic.clientInputs.action || null,
            payload: checkedPayload || null
        }
        console.log('\n[repoHelper]', action, payload);
        
        // check req method
        switch(reqMethod) {
            case 'POST': case 'PATCH':
                // check body keys
                const [bodyStatus, bodyError] = this.matchBodyKeys(authentic.clientInputs)
                // return if something doesnt match in body
                if(bodyStatus) {
                    return [bodyStatus, bodyError]
                }
                return this.checkReqBody(authentic.authKey, action, payload)
        }
        // return null message
        return [false, null]
    }

    // match payload keys with determined keys
    // check if payload value is empty
    private checkReqBody(authKey: string, action: string | null, payload: object | null): repoHelperInputsType {
        if(action === null || payload === null) {
            const message: IResponse = this.respond.createObject(400, 'action / payload is null', [])
            return [true, message]
        }
        // get payload keys
        const payloadKeys = Object.keys(payload)
        // check post action
        if(authKey !== action) {
            const message: IResponse = this.respond.createObject(400, 'action is not allowed', [])
            return [true, message]
        }
        // check if payload is empty
        else if(payloadKeys == null || payloadKeys.length === 0) {
            const message: IResponse = this.respond.createObject(400, 'payloadKeys is empty', [])
            return [true, message]
        }
        // loop the payload keys 
        for(let key of payloadKeys) {
            // check the keys
            switch(true) {
                // if the key match, break the switch
                case this.matchPayloadKeys(action, key):
                    break
                // if the key doesnt match with IRequestInsertWord interface, return error
                default:
                    const message: IResponse = this.respond.createObject(400, `wrong payload property!`, [])
                    return [true, message]
            }
        }
        // loop payload key values
        for(let [key, value] of Object.entries(payload)) {
            // check typeof payload key
            const isPayloadValueTrue = this.checkPayloadKeysValue(authKey, key, value)
            if(isPayloadValueTrue) {
                // return response if type doesnt match
                const message: IResponse = this.respond.createObject(400, `'${key}' data type / value length doesnt match!`, [])
                return [true, message]
            }
        }
        // return null message
        return [false, null]
    }

    // match req.body keys with determined body keys
    private matchBodyKeys(clientInputs: IAuthClientReq['clientInputs']): repoHelperInputsType {
        // get body keys
        const bodyKeys = Object.keys(clientInputs)
        // check body
        switch(true) {
            case bodyKeys.join(',') === 'action,payload':
                return [false, null]
            // if the req.body keys any other than above cases
            // return error 
            default:
                const message: IResponse = this.respond.createObject(400, 'request object is null / doesnt match!', [])
                return [true, message]
        }
    }

    // ~~ side method ~~
    private matchPayloadKeys(authKey: string, key: string) {
        // checking action
        switch(authKey) {
            case 'register player':
                // using || operator is possible cuz this method is used with looping
                // so it will check the key 2x
                return key === 'id' || key === 'username' ? true : false
            case 'insert words':
                return key === 'category' || key === 'word' ? true : false
            case 'create room':
                return key === 'id' || key === 'name' || key === 'password' || key === 'num_players' 
                    || key === 'max_players' || key === 'rules' || key == 'status'
                    ? true : false
            case 'update room':
                return key === 'id' || key === 'thread_id' || key === 'num_players' || key === 'status' ? true : false
            case 'insert rounds':
                return key === 'room_id' || key === 'round_number' || key === 'game_rounds'
                    || key === 'player_id' || key === 'answer_id' || key === 'answer_points' ? true : false
            case 'update profile':
                // player_id, game_played, words_correct, words_used
                return key === 'player_id' || key === 'game_played' || key === 'words_correct' || key === 'words_used' ? true : false
            default:
                return false
        }
    }

    // for checking type of value before inserting to database
    // some of table columns are text because when parseInt id (string) to id (number)
    // the id value changed because its BIG INTEGER
    private checkPayloadKeysValue(authKey: string, key: string, value: string | number) {
        switch(authKey) {
            case 'register player':
                // check is ID number 
                if(key === 'id') {
                    return isNaN(value as number) ? true : false
                }
                // and USERNAME length <= 30
                else if(key === 'username') {
                    const valueLen = (value as string).length
                    return valueLen < 3 && valueLen > 30 ? true : false
                }
            case 'create room':
                // check is ID number 
                if(key === 'id') {
                    return isNaN(value as number) ? true : false
                }
                // check room name length
                else if(key === 'name') {
                    const valueLen = (value as string).length
                    return valueLen < 3 && valueLen > 20 ? true : false
                }
            case 'insert rounds':
                if(key === 'room_id') {
                    return isNaN(value as number) ? true : false
                }
                else if(key === 'player_id') {
                    return isNaN(value as number) ? true : false
                }
                else if(key === 'answer_id') {
                    return isNaN(value as number) ? true : false
                }
            case 'update profile':
                if(key === 'player_id') {
                    return isNaN(value as number) ? true : false
                }
            default:
                return false
        }
    }
}