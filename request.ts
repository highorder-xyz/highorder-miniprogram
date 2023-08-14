
type HttpMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT' | undefined;

export type Options = Record<string, any>

export class HttpResponse {
    ok: boolean
    body: any
    status: number
    headers: Record<string, any>
    cookies: Array<string>

    constructor(status:number, headers:Record<string, any>, body:any, cookies?:Array<string>){
        if(Math.floor(status/100) <= 2){
            this.ok = true
        } else {
            this.ok = false
        }
        this.status = status
        this.headers = headers
        this.body = body
        this.cookies = cookies ?? []
    }
    
    async json<T = unknown>(): Promise<T>{
        if( typeof this.body === 'string'){
            return JSON.parse(this.body)
        }
        return {} as T
    }
    
    async text(): Promise<string> {
        return this.body
    }
}

export type KyResponse = HttpResponse

export class HttpRequest {
    url: string
    method: HttpMethod
    header: Record<string, any>
    data: object | string | ArrayBuffer
    dataType: string
    
    constructor(args: Record<string, any>){
        this.url = args.url
        this.method = args.method ?? "GET"
        this.header = args.header ?? {}
        this.data = args.data ?? ""
        this.dataType = args.dataType ?? "text"
    }

}

export class HTTPError extends Error {
	public response: HttpResponse;
	public request: HttpRequest;

	constructor(response: HttpResponse, request: HttpRequest,) {
		const code = (response.status || response.status === 0) ? response.status : '';
		const status = `${code}`.trim();
		const reason = status ? `status code ${status}` : 'an unknown error';

		super(`Request failed with ${reason}`);

		this.name = 'HTTPError';
		this.response = response;
		this.request = request;
	}
}

export class TimeoutError extends Error {
	public request: HttpRequest;

	constructor(request: HttpRequest) {
		super('Request timed out');
		this.name = 'TimeoutError';
		this.request = request;
	}
}

export async function request(url:string, options:Options): Promise<KyResponse> {
    let url_prefix = options.prefixUrl ?? ""
    if(url_prefix.length > 0 && url_prefix.slice(-1) !== '/'){
        url_prefix = `${url_prefix}/`
    }
    const response: KyResponse = await new Promise((resolve, reject) => {
        const req = new HttpRequest({
            url: `${url_prefix}${url}`,
            method: options.method,
            header: options.headers ?? {},
            data: options.body ?? "",
            dataType: "text"
        })
        uni.request({
            url: req.url,
            method: req.method,
            header: req.header,
            data: req.data,
            dataType: req.dataType,
            timeout: options.timeout ?? 10000,
            success: (res) => {
                const respone = new HttpResponse(
                    res.statusCode,
                    res.header,
                    res.data,
                    res.cookies
                )
                resolve(respone)
            },
            fail: (err) => {
                if(err.errMsg && err.errMsg.includes('timeout')){
                    const timeoutErr = new TimeoutError(req)
                    reject(timeoutErr)
                } else {
                    reject(err)
                }
            }
        })
    })
    return response
}

export const ky = request