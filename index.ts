
import { AppCore, AppConfig} from "./core"
import { app_platform, AdReady, AdOptions, AdPlugin, WeChatPlugin} from './platform'


export function setup(app_configs: AppConfig[], init_options:Record<string, any>) {
    for(const config of app_configs){
        AppCore.addAppConfig(config)
    }
    app_platform.init_options = init_options
}

class MiniProgramAdPlugin {
    adNum: number = 0

    async initialize(options: Record<string, any>): Promise<void> {
        console.log('WebAdSimulationPlugin initialize', options)
    }

    async prepareInterstitial(options: AdOptions): Promise<void> {
        this.adNum += 1
    }

    async showInterstitial(): Promise<void> {

        if (this.adNum > 0)
            this.adNum -= 1
    }

    async isInterstitialReady(): Promise<AdReady> {
        return { ready: this.adNum > 0 }
    }

    async prepareReward(options: AdOptions): Promise<void> {
        this.adNum += 1
    }

    async showReward(options: AdOptions): Promise<void> {

        if (this.adNum > 0)
            this.adNum -= 1
    }

    async isRewardReady(options: AdOptions): Promise<AdReady> {
        return { ready: this.adNum > 0 }
    }
}

class MiniProgramWeChatPlugin {

    async initialize(options: { appId: string, merchantId?: string }): Promise<void> {
    }

    async isInstalled(): Promise<{ installed: boolean }> {
        return { installed: false }
    }

    async pay(payParam: { prepayId: string; packageValue: string; nonceStr: string; timeStamp: string; sign: string }): Promise<{ value: string }> {
        console.log(payParam);
        return { value: '' };
    }

    async launchMiniProgram(options: { userName: string; path: string; miniProgramType: number }): Promise<void> {
        console.log(options);
    }

    async shareImage(options: { image: string; title: string; description: string; scene: number }): Promise<void> {
        console.log(options);
    }

    async shareLink(options: { url: string; title: string; description: string; thumb?: string; scene: number }): Promise<void> {
        console.log(options);
    }

    async shareMiniProgram(options: { webpageUrl: string; userName: string; path: string; hdImageData: string; withShareTicket: boolean; miniProgramType: number; title: string; description: string; scene: number }): Promise<void> {
        console.log(options);
    }

    async shareText(options: { text: string; scene: string }): Promise<void> {
        console.log(options);
    }

    async sendAuthRequest(options: { scope: string; state: string }): Promise<void> {
        console.log(options);
    }

    async wxOpenCustomerServiceChat(options: { corpId: string; url: string }): Promise<any> {
        console.log(options);
    }
}

export class MiniProgramHostPlatform {
    adPlugins: Record<string, AdPlugin> = {}
    wechatPlugin: WeChatPlugin

    constructor() {
        this.wechatPlugin = new MiniProgramWeChatPlugin();
    }

    async initialize(options: Record<string, any>): Promise<void> {
    }

    exitApp() {

    }

    openUrl(url: string) {
        window.open(url, '_blank');
    }

    mustAgreePrivacy() {
        return false;
    }

    getPlatform() {
        const info = uni.getSystemInfoSync()
        return {
            "name": "miniprogram",
            "vendor": info.deviceBrand,
            "os": info.osName,
            "os_version": info.osVersion,
            "language": info.osLanguage,
            "screen_size": {
                "width": info.screenWidth,
                "height": info.screenHeight
            },
            "page_size": {
                "width": info.windowWidth,
                "height": info.windowHeight
            },
            "is_virtual": false,
            "web_version": info.browserVersion,
        }
    }

    getAdPluginInstance(vendor: string) {
        if (!this.adPlugins.hasOwnProperty(vendor)) {
            this.adPlugins[vendor] = new MiniProgramAdPlugin()
        }
        return this.adPlugins[vendor]
    }

    getWeChatPluginInstance() {
        return this.wechatPlugin;
    }


    async setUser(user_id: string, property: Record<string, string>) {

    }

    async logEvent(name: string, params: Record<string, unknown>) {
        console.log('AnalyticsEvent', name, params)
    }
}

app_platform.register(new MiniProgramHostPlatform())

type RequestMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT' | undefined;


async function miniprogram_fetch(resource: RequestInfo, options?: RequestInit) {
    let originFetch = window.fetch;
    let url: string = resource.toString();
    let method = options?.method ? options.method : undefined
    let body = options?.body ? options.body : ""
    if (body !== undefined){
        body = body.toString()
    }
    let headers = options?.headers;
    if (options?.headers instanceof Headers) {
        headers = Object.fromEntries((options.headers as any).entries());
    }

    if (resource instanceof Request) {
        let req = resource as Request
        console.log('request', req)
        url = req.url;
        method = req.method
        body = await req.text()
        headers = Object.fromEntries((req.headers as any).entries())
    } else {

    }

    if (
        !(
            url.startsWith('http:') ||
            url.startsWith('https:')
        )
    ) {
        return originFetch(resource, options);
    }

    const tag = `TauriHttp fetch ${Date.now()} ${resource}`;
    console.time(tag);
    try {
        const nativeResponse = await new Promise<any>((resolve, reject) => {
            uni.request({
                url: url,
                method: (method ?? "GET") as RequestMethod,
                data: body,
                headers: headers,
                success: (res) => {
                    resolve(res)
                },
                fail: (err) => {
                    reject(err)
                }
            });
        });
        const data =
            typeof nativeResponse.data === 'string'
                ? nativeResponse.data
                : JSON.stringify(nativeResponse.data);
        // intercept & parse response before returning
        const response = new Response(data, {
            headers: nativeResponse.header,
            status: nativeResponse.statusCode,
        });

        console.timeEnd(tag);
        return response;
    } catch (error) {
        console.timeEnd(tag);
        return Promise.reject(error);
    }
};

app_platform.setCustomFetch(miniprogram_fetch)
