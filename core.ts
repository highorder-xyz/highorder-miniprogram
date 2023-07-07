import { reactive, UnwrapNestedRefs } from "vue"

const CORE_VERSION = '0.1.0'

export interface HyperElement {
    type: string
    name: string
    style?: Record<string, any>
}


export class Page {
    static instances: Record<string, UnwrapNestedRefs<Page>> = {}
    app_id: string
    name: string
    route: string
    elements: Array<HyperElement>
    version: number

    static getPage(app_id: string){
        if(this.instances.hasOwnProperty(app_id)){
            return this.instances[app_id]
        } else {
            const page = reactive(new Page(app_id))
            this.instances[app_id] = page
            return page
        }
    }

    constructor(app_id: string) {
        this.app_id = app_id
        this.name = "app"
        this.route = '/'
        this.elements = []
        this.version = 0
    }

    reset() {
        this.version += 1
    }

    isEmpty() {
        return this.elements.length === 0
    }
}

export let appGlobal = reactive({"app_id": ""})
export const core_objects = reactive({
    "page": {
        "elements": [
            {
            	name: 'image',
                is_container: false,
                props: {
                    "cls": "logo",
                    "src": "/static/logo.png"
                },
                elements: [
                    
                ]
            }
        ]
        
    }
})

export const page = core_objects.page
