import { Respond } from "./Respond";
import { IAuthClientReq, IResponse, repoHelperInputsType } from "./types";

export class RepoHelper {
    private respond = new Respond()

    /**
     * @param action value from client
     * @param authentic object that contains stuff for req.body auth
     * @returns [true, error] if something wrong with the req.body
     */
    checkClientInputs(authentic: IAuthClientReq): repoHelperInputsType {
        const { reqMethod, action, payload } = {
            reqMethod: authentic.reqMethod,
            action: authentic.clientInputs.action || null,
            payload: authentic.clientInputs.payload || null
        }
        // check req method
        switch(reqMethod) {
            case 'POST':
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
    private checkReqBody(authKey: string, action: string | null, payload: IAuthClientReq['clientInputs']['payload'] | null): repoHelperInputsType {
        if(action === null || payload === null) {
            const message: IResponse = this.respond.createObject(400, 'action / payload is null', [])
            return [true, message]
        }
        // exclude object type in union IAuthClientReq
        type IAuthClientReqArray = Exclude<IAuthClientReq['clientInputs']['payload'], { id: string }>
        type IAuthClientReqObject = Exclude<IAuthClientReq['clientInputs']['payload'], [{ category: string }]>
        // get payload keys
        const payloadKeys = (payload as IAuthClientReqArray).length != null 
                            ? (payload as IAuthClientReqArray).map(v => { return Object.keys(v) })[0] 
                            : Object.keys(payload as IAuthClientReqObject)
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
        for(let [key, value] of Object.entries(payload as IAuthClientReqObject)) {
            // check typeof payload key
            const isPayloadValueTrue = this.checkPayloadKeysValue(authKey, key, value)
            if(isPayloadValueTrue) {
                // return response if type doesnt match
                const message: IResponse = this.respond.createObject(400, `'${key}' wrong type of value!`, [])
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
                return key === 'name' || key === 'password' || key === 'num_players' || key === 'max_players' || key === 'rules'
                    ? true : false
            default:
                return false
        }
    }

    private checkPayloadKeysValue(authKey: string, key: string, value: string | number) {
        switch(authKey) {
            case 'register player':
                // check is ID number 
                if(key === 'id') {
                    return isNaN(value as number) ? true : false
                }
                // and USERNAME length <= 30
                else if(key === 'username') {
                    return (value as string).length > 30 ? true : false
                }
            default:
                return false
        }
    }
}