
import { SessionDetail, UserDetail } from './client';

export function randomString(n: number, charset?: string): string {
    let res = '';
    let chars =
        charset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charLen = chars.length;

    for (var i = 0; i < n; i++) {
        res += chars.charAt(Math.floor(Math.random() * charLen));
    }

    return res;
}

export class DataStore {
    static async init() {
    }

    static async get(key: string){
        return new Promise<object|string|number>((resolve, reject) => {
            uni.getStorage({
                key: `kvstore_${key}`,
                success: function (res) {
                    resolve(res.data);
                },
                fail: function(err) {
                    reject(err)
                }
            })
        })
    }

    static async save(value: {key:string, value:object | string | number}){
        return new Promise<boolean>((resolve, reject) => {
            uni.setStorage({
                key: `kvstore_${value.key}`,
                data: value.value,
                success: function () {
                    resolve(true);
                },
                fail: function(err) {
                    reject(err)
                }
            })
        })
    }

    static async get_app_kv(key: [string, string]){
        return new Promise<object|string|number>((resolve, reject) => {
            uni.getStorage({
                key: `app_kvstore_${key[0]}_${key[1]}`,
                success: function (res) {
                    resolve(res.data);
                },
                fail: function(err) {
                    reject(err)
                }
            })
        })
    }

    static async save_app_kv(value: {app_id:string, key:string, value:object | string | number}){
        return new Promise<boolean>((resolve, reject) => {
            uni.setStorage({
                key: `app_kvstore_${value.app_id}_${value.key}`,
                data: value.value,
                success: function () {
                    resolve(true);
                },
                fail: function(err) {
                    reject(err)
                }
            })
        })
    }

    static async delete_app_kv(value: {app_id:string, key:string}){
        return new Promise<boolean>((resolve, reject) => {
            uni.removeStorage({
                key: `app_kvstore_${value.app_id}_${value.key}`,
                success: function () {
                    resolve(true);
                },
                fail: function(err) {
                    reject(err)
                }
            })
        })
    }
}


export class AppDataStore {
    static instances: Record<string, AppDataStore>  = {}

    app_id: string

    static async get_store(app_id: string){
        if(this.instances.hasOwnProperty(app_id)){
            return this.instances[app_id]
        } else {
            const store = new AppDataStore(app_id)
            this.instances[app_id] = store
            await store.genInitValue()
            return store
        }

    }

    async genInitValue() {
        const value = await DataStore.get_app_kv([this.app_id, 'local_uid']) as string
        if( value === undefined){
            const local_uid = randomString(32)
            await DataStore.save_app_kv({
                app_id: this.app_id,
                key:'local_uid',
                value: local_uid
            })
        }

    }

    constructor(app_id: string){
        this.app_id = app_id
    }

    async getLocalUid(): Promise<string | undefined> {
        return await DataStore.get_app_kv([this.app_id,'local_uid']) as string
    }

    async getCustomUid(): Promise<string | undefined> {
        return await DataStore.get_app_kv([this.app_id,'custom_uid']) as string
    }

    async saveCustomUid(custom_uid: string){
        await DataStore.save_app_kv({app_id: this.app_id, key: 'custom_uid', value: custom_uid})
    }

    async saveUser(user: UserDetail){
        await DataStore.save_app_kv({app_id: this.app_id, key: 'user', value: user})
    }

    async getUser(): Promise<UserDetail | undefined> {
        return await DataStore.get_app_kv([this.app_id,'user']) as UserDetail
    }

    async saveSession(session: SessionDetail){
        await DataStore.save_app_kv({app_id: this.app_id, key: 'session', value: session})
    }

    async getSession(): Promise<SessionDetail | undefined> {
        return await DataStore.get_app_kv([this.app_id, 'session']) as SessionDetail
    }

    async deleteSession() {
        await DataStore.delete_app_kv({app_id: this.app_id, key: 'session'})
    }
}
