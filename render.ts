import { reactive, UnwrapNestedRefs } from 'vue'
import i18next from 'i18next';
import {
    PlainTextObject,
    HeaderElement,
    FooterElement, HeroElement, NavMenuElement, MenuItemElement,
    LogoElement,
    DecorationElement, MotionElement, PlayableElement,
    ActionBarElement,
    ActionElement,
    ModalWidgetElement,
    SeparatorElement,
    TitleElement,
    ParagraphElement,
    BulletedListElement,
    Item,
    ButtonElement,
    ModalElement,
    StarRatingElement,
    IconTextElement,
    AnnotationTextObject,
    RowLineElement,
    IconTitleElement,
    TableViewElement,
    HolaElement,
    CardElement,
    CardSwiperElement,
    ColumnElement,
    IconNumberElement,
    AnalyticsEventKind,
    appGlobal,
    Page,
    AppCore,
    AppConfig,
    VideoElement,
    ImageElement,
    IconElement,
    ProgressBarElement,
    NavBarElement,
    LinkElement
} from './core'
import {
    InitAdCommand,
    InitAdCommandArg,
    ShowAdCommand,
    ShowAdCommandArg,
    PlayableResult,
    HolaCommand,
    ShowAlertCommandArg,
} from './client'
import resources from './common/locales.json'
import { app_platform} from './platform'
import { AdHelper, AdShowOptions } from './ad';
import { randomString } from './db';

export interface ConditionResponse {
    ok: boolean
    message?: string,
}

export interface ActionDefinition {
    icon?: string,
    text?: string,
    size?: string,
    clicked?: () => void
}

export interface IconActionDefinition {
    name: string,
    text?: string,
    icon?: string,
    image?: string,
    count?: number,
    clicked?: Function
}

export interface MenuItem {
    text: string
    sub_text?: string
    disable?: boolean
    disable_text?: string
    icon?: string
    name?: string
    clicked?: Function
}

export interface RenderContext {
    route: string;
    modal_id: string | undefined;
}

function h(name:string, props?: object, slots?: Record<string, any>){
    let sub_elements: Record<string, object[]>  = {}
    if(slots !== undefined){
        for(const [name, slot] of Object.entries(slots)){
            let elements = (slot as Function)()
            if(! Array.isArray(elements)){
                elements = [elements]
            }
            let new_name = 'elements'
            if( name !== 'default'){
                new_name = `${name}_elements`
            }
            sub_elements[name] = elements
        }
    }

    const rendered = {
        "name": name,
        props: {...props},
        elements:{...sub_elements}
    }
    return rendered
}

export interface AlertOption{
    top?:number,
    bottom?: number,
    width?: number,
    duration?: number,
    closeIn?: number
}

let started = false;

export async function startup(): Promise<void> {
    const init_options = app_platform.init_options
    const platform_info = app_platform.getPlatform()
    const language = init_options.language || platform_info['language'] || 'en'

    await i18next.init({
        lng: language,
        debug: false,
        resources: resources
    });

    await AppCore.init()
    const app_id = AppCore.app_configs.default.appId
    await AppCore.switchTo(app_id)
    await app_platform.initialize(init_options)
}

const init_elements = [
    {
        name: "column",
        props: {
            "class": "splash_container",
        },
        elements: {
            default: [{
                name: 'image',
                props:{
                    "src": "/static/logo.png",
                    "class":"splash_logo"
                }
            }]
        }
    }

]

export class AlertHelper {
    option:AlertOption
    ref: string

    constructor(option:AlertOption | undefined = undefined) {
        this.option = option ?? {
            top: 40,
            bottom: 40,
            width: 360,
            duration: 300,
            closeIn: 3000
        }
        const num = Math.floor(Math.random() * (9999 - 1000) + 1000)
        this.ref = 'alert_root_' + num.toString()
    }

    show(alertMessage: string,
        alertHeader?: string,){
    }

    render() {

    }
}


export type ModalOption = Record<string, any>

export class ModalUpdater {
    helper: ModalHelper
    modal_id: string


    constructor(helper:ModalHelper, modal_id:string)
    {
        this.helper = helper
        this.modal_id = modal_id
    }

    update(option:ModalOption){
        this.helper.update(this.modal_id, option)
    }
}

export interface ModalParameter {
    modal_id: string;
    option: ModalOption;
    slot_render?: Function;
    close_listeners: Array<(param:ModalParameter) => void>;
}

export class ModalHelper {
    root_modal: ModalParameter | undefined
    current: ModalParameter | undefined
    modal_stack: Array<ModalParameter>
    // close_listeners: Array<(param:ModalParameter) => void>

    constructor() {
        this.root_modal = undefined
        this.modal_stack = []
        this.current = undefined
        // this.close_listeners = []
    }

    new_modal_id(){
        return randomString(10)
    }

    open_any(option: ModalOption, slot_render: Function | undefined = undefined){
        const modal_id = this.new_modal_id()
        if(this.current){
            const param: ModalParameter = {modal_id: modal_id, option: option, slot_render:slot_render, close_listeners:[]}
            return this.open_sub(param, { route: '/unknown', modal_id: this.current?.modal_id})
        } else {
            return this.open(modal_id, option, slot_render)
        }

    }

    open(modal_id:string, option: ModalOption, slot_render: Function | undefined = undefined){
        if(this.current){
            return new ModalUpdater(this, this.current.modal_id)
        }
        const param: ModalParameter = {modal_id: modal_id, option: option, slot_render:slot_render, close_listeners:[]}
        param.option['onModalClosed'] = () => {
            this.close()
        }
        this.current = param
        this.root_modal = param
        return new ModalUpdater(this, param.modal_id)
    }

    async open_wait(modal_id:string, option: ModalOption, context:RenderContext, slot_render: Function | undefined = undefined){
        if(this.current && this.current.modal_id !== context.modal_id){
            console.log('open wait modal error. current modal exists.')
            return
        }
        const param: ModalParameter = {modal_id: modal_id, option: option, slot_render:slot_render, close_listeners:[]}
        return new Promise<void>((resolve) => {
            param.close_listeners.push((param:ModalParameter) => {
                resolve()
            })
            if(this.current){
                this.open_sub(param, context, false)
            } else {
                param.option['onModalClosed'] = () => {
                    this.close()
                }
                this.current = param
                this.root_modal = param
            }

        })
    }

    open_sub(param: ModalParameter, context: RenderContext, inplace:boolean = false){
        if(!this.current){
            console.log('error open_sub modal,  must be called in modal')
            return
        }
        if(this.current && this.current.modal_id !== context.modal_id){
            console.log('error open_sub modal, current modal_id not match parent_model_id')
            return
        }
        if(!inplace){
            this.modal_stack.push(this.current)
        } else {
            param.close_listeners = param.close_listeners.concat(this.current.close_listeners)
        }
        this.current = undefined
        param.option['onModalClosed'] = () => {
            this.popup(param.modal_id)
            console.log('modal close, new current', this, this.current)
        }
        this.current = param
    }


    update(modal_id:string, option:ModalOption){
        const current = this.current
        if(current) {
            if(modal_id === current.modal_id){
                current.option = {...current.option, ...option}
            }
        }

    }

    render(){
        if(this.current){
            const current = this.current
            if(current.slot_render !== undefined){
                const slot_render = current.slot_render
                return h("modal", {id: `modal_${current.modal_id}`, showNow:true, modal_id:current.modal_id, ...current.option}, {
                    default: () => {
                        return slot_render()
                    }
                })
            } else if( current.option ) {
                return h("modal", {id: `modal_${current.modal_id}`, showNow:true, modal_id:current.modal_id, ...current.option}, {
                    default: () => {
                        return []
                    }
                })
            }
        }
    }

    popup(modal_id:string){
        if(this.current && this.current?.modal_id === modal_id){
            if(this.modal_stack.length > 0){
                const current = this.current
                const param = this.modal_stack.pop()
                this.current = param
                for(const listener of current.close_listeners){
                    listener(current)
                }
            } else {
                this.close()
            }

        }
    }

    close(){
        const param = this.root_modal
        if(this.root_modal){
            this.reset()
        }
        if(param){
            for(const listener of param.close_listeners){
                listener(param)
            }
        }
    }

    reset() {
        this.current = undefined
        this.root_modal = undefined
        this.modal_stack = []
    }
}


export class PageRender {
    static instances: Record<string, UnwrapNestedRefs<PageRender>> = {}
    app_id: string
    loading: boolean
    page: Page
    alert_helper: AlertHelper
    modal_helper: ModalHelper
    ad_helper: AdHelper
    elements: Array<object>

    static getPageRender(app_id: string){
        if(this.instances.hasOwnProperty(app_id)){
            return this.instances[app_id]
        } else {
            const page = reactive(new PageRender(app_id))
            this.instances[app_id] = page
            return page
        }
    }

    constructor(app_id:string) {
        this.app_id = app_id
        this.loading = true
        this.page = Page.getPage(this.app_id)
        this.alert_helper = new AlertHelper()
        this.modal_helper = new ModalHelper()
        this.ad_helper = new AdHelper()
        this.elements = init_elements
    }


    sessionStart(){
        const timerId = setTimeout(()=> {
            this.loading = true;
        }, 1000)
        const app_core = AppCore.getCore(this.app_id)
        app_core.sessionStart().then((commands: HolaCommand[]) => {
            console.log('session start.')
            clearTimeout(timerId)
            this.loading = false
            this.handleImmediateCommands(commands, {route:"/", modal_id: undefined, })
        }).catch((err: Error) => {
            console.log('load home page error.', err)
            clearTimeout(timerId)
            this.loading = false
            const modal_id = this.modal_helper.new_modal_id()
            this.modal_helper.open(modal_id, {
                text: i18next.t('makesure_network_and_latest_version'),
                actionsVertical: true,
                actionConfirmText: i18next.t('retry_text'),
                onModalConfirmed: () => {
                    this.alert_helper.show(i18next.t('retring_and_waiting'))
                    app_platform.logEvent(AnalyticsEventKind.button_event, {
                        route: this.page.route,
                        text: "errdlg_confirm"
                    })
                    this.sessionStart()
                }
            })
        })
    }

    callAction(args:Record<string, any>, context: RenderContext){
        const app_core = AppCore.getCore(this.app_id)
        app_core.callAction(args).then((commands: HolaCommand[]) => {
            this.handleImmediateCommands(commands, context)
        }).catch((err: Error) => {
            throw err;
        })
    }

    loginWeixin(context: RenderContext) {
        const app_core = AppCore.getCore(this.app_id)
        app_core.loginWeixin().then((commands: HolaCommand[]) => {
            this.handleImmediateCommands(commands, context)
        }).catch((err: Error) => {
            throw err;
        })
    }

    navigateTo(route:string, context: RenderContext){
        const timerId = setTimeout(()=> {
            this.loading = true;
        }, 1000)
        const app_core = AppCore.getCore(this.app_id)
        app_core.navigateTo(route).then((commands: HolaCommand[]) => {
            clearTimeout(timerId)
            this.loading = false
            this.handleImmediateCommands(commands, context)
        }).catch((err: Error) => {
            clearTimeout(timerId)
            this.loading = false
            const modal_id = this.modal_helper.new_modal_id()
            this.modal_helper.open(modal_id, {
                text: i18next.t('makesure_network_and_latest_version'),
                actionsVertical: true,
                actionConfirmText: i18next.t('retry_text'),
                onModalConfirmed: () => {
                    this.alert_helper.show(i18next.t('retring_and_waiting'))
                    app_platform.logEvent(AnalyticsEventKind.button_event, {
                        route: this.page.route,
                        text: "errdlg_confirm"
                    })
                    this.navigateTo(route, context)
                }
            })
        })
    }

    playableNext(level_id:string, context: RenderContext) {
        const app_core = AppCore.getCore(this.app_id)
        app_core.playableNext(level_id).then((commands: HolaCommand[]) => {
            this.handleImmediateCommands(commands, context)
        }).catch((err: Error) => {
            throw err;
        })
    }

    playableRetry(level_id:string, context: RenderContext) {
        const app_core = AppCore.getCore(this.app_id)
        app_core.playableRetry(level_id).then((commands: HolaCommand[]) => {
            this.handleImmediateCommands(commands, context)
        }).catch((err: Error) => {
            throw err;
        })
    }

    playableCompleted(played: PlayableResult, context: RenderContext) {
        const app_core = AppCore.getCore(this.app_id)
        app_core.playableCompleted(played).then((commands: HolaCommand[]) => {
            this.handleImmediateCommands(commands, context)
        }).catch((err: Error) => {
            throw err;
        })
    }

    handleBackTo(target: any, context: RenderContext) {
        const new_hash = (target as Window).location.hash
        if (new_hash.length > 1) {
            this.navigateTo(new_hash.slice(1), context)
        }
    }

    executeUseItem(item_name: string, context:RenderContext){
        const app_core = AppCore.getCore(this.app_id)
        app_core.itemUse(item_name).then((commands: HolaCommand[]) => {
            this.handleImmediateCommands(commands, context)
        }).catch((err: Error) => {
            throw err;
        })
    }

    executeBuyItem(item_name: string, context:RenderContext){
        const app_core = AppCore.getCore(this.app_id)
        app_core.itemBuy(item_name).then((commands: HolaCommand[]) => {
            this.handleImmediateCommands(commands, context)
        }).catch((err: Error) => {
            throw err;
        })
    }

    executeShowAd(ad_args: Record<string, any>, callback:Function) {
        console.log('show ad', ad_args)
        this.ad_helper.showAdNow(ad_args as AdShowOptions, (ret: ConditionResponse) => {
            if(ret.ok){
                app_platform.logEvent(AnalyticsEventKind.ad_show_event, {
                    name: "active",
                    route: this.page.route,
                    vendor: ad_args['ad_vendor'],
                    ad_type: ad_args['ad_type']
                })
            }

            callback(ret)
        })
    }

    async handleImmediateCommands(commands: HolaCommand[], context: RenderContext){
        for(const [idx, command] of commands.entries()){
            if(command.name === 'start_new_session'){
                this.sessionStart()
            } else if(command.name === 'show_motion'){
            } else if (command.name === 'show_alert'){
                const args = command.args as ShowAlertCommandArg
                const msg = args.text
                const title = args.title
                console.log('show_alert', args)
                this.alert_helper.show(msg, title)
            } else if (command.name === 'show_modal'){
                const open_modal = command.args as ModalElement
                const modal_id = this.modal_helper.new_modal_id()
                await this.modal_helper.open_wait(modal_id,
                    this.getModalOption(open_modal, context),
                    context,
                    () => {
                        if(open_modal.elements){
                            return this.renderModalElements(open_modal.elements, {
                                route: this.page.route,
                                modal_id: modal_id
                            })
                        }
                    }
                )
            } else if (command.name === 'init_ad') {
                const args = (command as InitAdCommand).args as InitAdCommandArg
                for(const config of args.configs) {
                    this.ad_helper.initAd(config)
                }
            } else if (command.name === 'show_ad') {
                const args = (command as ShowAdCommand).args as ShowAdCommandArg
                this.ad_helper.showAdNow(args, (ret: ConditionResponse) => {
                    const leftCommands = commands.slice(idx+1)
                    if(leftCommands.length > 0){
                        this.handleImmediateCommands(leftCommands, context)
                    }
                })
                app_platform.logEvent(AnalyticsEventKind.ad_show_event, {
                    name: "passive",
                    route: this.page.route,
                    vendor: args.ad_vendor,
                    ad_type: args.ad_type
                })
                break;
            } else if (command.name === 'playable_apply') {
            } else {
                console.error(`no handler for immediate command ${command.name}`)
            }
        }
        this.render()
    }

    executeAction(action: string, args: Record<string, any> = {}, context: RenderContext){
        console.log('execute action: ', action, args)
        const acts = action.split('.')
        if(acts.length < 1){
            console.error(`invalid action ${action}, with arg ${args}`)
            return
        }
        const ns = acts[0]

        if(ns === 'builtin'){
            const func = acts[1]
        } else if (ns === 'login') {
            const func = acts[1]
            if ( func === 'weixin' ){
                this.loginWeixin(context)
            } else {
                console.log(`unknown login action ${action}`)
            }
        } else if (ns === 'logout') {
            const func = acts[1]
        } else if (ns === 'route') {
            const func = acts[1]
            if ( func === 'back'){
                window.history.back()
            } else if ( func === 'navigate_to'){
                const target = args.route ?? '/'
                this.navigateTo(target, context)
            } else if ( func === 'refresh'){
                const target = this.page.route
                this.navigateTo(target, context)
            } else {
                console.log(`unknown playable action ${action}`)
            }
        } else if (ns === 'action') {
            const func = acts[1]
            if(func === 'call'){
                this.callAction(args, context)
            } else {
                console.log(`unknown action ${action}`)
            }
        } else if (ns === 'playable') {
        } else if (ns === 'item') {
            const func = acts[1]
            if(func === 'use'){
                this.executeUseItem(args["item_name"], context)
                app_platform.logEvent(AnalyticsEventKind.item_event, {
                    name: "use",
                    route: this.page.route,
                    item_name: args.item_name,
                    item_count: 1
                })
            }else if(func === 'buy'){
                this.executeBuyItem(args["item_name"], context)
                app_platform.logEvent(AnalyticsEventKind.item_event, {
                    name: "buy",
                    route: this.page.route,
                    item_name: args.item_name,
                    item_count: 1
                })
            } else {
                console.log(`unknown item action ${action}`)
            }
        } else if (ns === 'ad') {
            const func = acts[1]
            if(func === 'show'){
                const ad_args = args.ad_args
                this.executeShowAd(ad_args, () => {

                })
                app_platform.logEvent(AnalyticsEventKind.ad_show_event, {
                    name: "active",
                    route: this.page.route,
                    vendor: ad_args.ad_vendor,
                    ad_type: ad_args.ad_type
                })
            } else {
                console.log(`unknown ad action ${action}`)
            }
        } else {
            console.log(`unknown action ${action}`)
        }
    }

    executeConditionAction(action: string, args: Record<string, any>, callback: Function){
        console.log('execute condition action: ', action, args)
        const acts = action.split('.')
        if(acts.length < 1){
            console.error(`invalid action ${action}, with arg ${args}`)
            return
        }
        const ns = acts[0]
        if (ns === 'playable') {
        } else if (ns === 'ad') {
            const func = acts[1]
            if(func === 'show'){
                const ad_args = args
                this.executeShowAd(ad_args, (cond: ConditionResponse) => {
                    callback(cond)
                })

            } else {
                callback({ok: false, message: i18next.t('unsupported_condition')})
            }
        } else {
            callback({ok: false, message: i18next.t('unsupported_condition')})
        }
    }

    tranformStyle(style: Record<string, any>){
        const new_style: Record<string, any> = {}
        for(const [key, value] of Object.entries(style)){
            if(key === 'size'){
                new_style['h_size'] = value,
                new_style['v_size'] = value
            } else {
                new_style[key] = value
            }
        }
        return new_style
    }

    renderNavBar(element: NavBarElement, context: RenderContext): object {
        return h("navbar", {
            title: element.title ?? "",
            showHome:element.show_home || false,
            showBack: element.show_back || false,
            onHomeClicked: () => {
                this.navigateTo('/', context);
                app_platform.logEvent(AnalyticsEventKind.button_event, {
                    route: this.page.route,
                    text: 'home'
                })
            },
            onBackClicked: () => {
                window.history.back()
                app_platform.logEvent(AnalyticsEventKind.button_event, {
                    route: this.page.route,
                    text: 'back'
                })
            }
        }, {
            default: () => {
                const nodes = []
                if(element.elements){
                    for(const el of element.elements){
                        nodes.push(this.renderModalWidget(el, context))
                    }
                }
                return nodes
            }
        })
    }

    renderSubElements(elements: HolaElement[] | undefined, context: RenderContext): object[] {
        const sub_nodes:object[] = []
        if(elements && elements?.length > 0){
            for(const sub_element of elements){
                const n = this.renderElement(sub_element as HolaElement, context)
                if(n !== undefined){
                    sub_nodes.push(n)
                }
            }
        }
        return sub_nodes
    }

    renderHeader(element: HeaderElement, context: RenderContext): object {
        return h("header", {}, {
            "start": () => {
                return this.renderSubElements(element.start_elements, context)
            },
            "center": () => {
                return this.renderSubElements(element.elements, context)
            },
            "end": () => {
                return this.renderSubElements(element.end_elements, context)
            }
        })
    }

    renderFooter(element: FooterElement, context: RenderContext): object {
        const app_core = AppCore.getCore(this.app_id)
        const footer_main = element.element
        let text = ""
        if (footer_main && footer_main.type == 'plain-text') {
            text = (footer_main as PlainTextObject)["text"]
        }
        const right_actions: ActionDefinition[] = []
        if (element['right_elements']) {
            for (const simple_action of element['right_elements']) {
                right_actions.push({
                    icon: app_core.full_link(simple_action.icon) ?? '',
                    text: simple_action.text,
                    clicked: () => {
                        console.log('will rout to ', simple_action.route)
                        if(simple_action.route) {
                            this.navigateTo(simple_action.route, context)
                        }
                        app_platform.logEvent(AnalyticsEventKind.button_event, {
                            route: this.page.route,
                            text: simple_action.text
                        })
                    }
                })
            }
        }
        return h("footer", { text: text, rightActions: right_actions })
    }

    renderSeparator(element: SeparatorElement, context: RenderContext){
        return h("divider")
    }

    renderTitle(element: TitleElement, context: RenderContext){
        return h("title", {title: element.title, level: element.level, sub_title: element.sub_title ?? ""})
    }

    renderLink(element: LinkElement, context: RenderContext){
        return h("link", {text: element.text,
            target_url: element.target_url,
            open_mode: element.open_mode ?? "new",
            onClicked: () => {
                const url = element.target_url
                const open_mode = element.open_mode ?? "new"
                if(open_mode === "new"){
                    app_platform.openUrl(url)
                }
            }
        })
    }


    renderParagraph(element: ParagraphElement, context: RenderContext){
        return h("paragraph", {
            text: element.text,
            align: element.align
        })
    }

    renderBulletedList(element: BulletedListElement, context: RenderContext){
        return h("bulleted_list", {
            texts: element.texts
        })
    }

    renderStarRating(element: StarRatingElement, context: RenderContext){
        return h("star_rating", {rating:element.rating, annimation:element.animate})
    }

    renderIcon(element: IconElement, context: RenderContext){
        const style = element.style ?? {}
        const app_core = AppCore.getCore(this.app_id)
        return h("icon", {...style, icon:app_core.full_link(element.icon)})
    }

    renderIconText(element: IconTextElement, context: RenderContext){
        const style = element.style ?? {}
        const app_core = AppCore.getCore(this.app_id)
        return h("icon_text", {...style, text:element.text, icon:app_core.full_link(element.icon)})
    }

    renderIconNumber(element: IconNumberElement, context: RenderContext){
        const app_core = AppCore.getCore(this.app_id)
        return h("icon_count_text", {
            icon: app_core.full_link(element.icon),
            animate: element.animate,
            wrapper: {
                count: element.number
            }
        })
    }

    renderIconTitle(element: IconTitleElement, context: RenderContext){
        const app_core = AppCore.getCore(this.app_id)
        return h("icon_title", {icon: app_core.full_link(element.icon), count:element.count})
    }

    renderButton(element: ButtonElement, context: RenderContext){
        const actionFn = () => {
            this.executeAction(element.action, element.args, context)
        }

        const style = this.tranformStyle(element.style ?? {})
        let close_modal = false
        if(element.action_props){
            close_modal = element.action_props!['close_modal'] ?? false
        }
        return h("button", {
            text: element.text,
            icon: element.icon,
            sub_text: element.sub_text ?? "",
            disable: element.disable ?? false,
            disable_text: element.disable_text ?? "",
            ...style,
            color: element.style?.color ?? "surface",
            onClicked:() => {
                if(element.show_ad){
                    this.ad_helper.showAdNow(element.show_ad as AdShowOptions, (ret: ConditionResponse) => {
                        if(ret.ok){
                            if(element.action){
                                actionFn();
                            }
                        } else {
                            if(ret.message){
                                this.alert_helper.show(ret.message)
                            }
                        }
                        if (context.modal_id !== undefined){
                            this.modal_helper.popup(context.modal_id)
                        }
                    })
                    app_platform.logEvent(AnalyticsEventKind.ad_show_event, {
                        name: "active",
                        route: this.page.route,
                        vendor: element.show_ad['ad_vendor'],
                        ad_type: element.show_ad['ad_type']
                    })
                } else if (element.open_modal){
                    this.openModal(element.open_modal as ModalElement, element.open_modal_args ?? {}, context)
                } else if (element.action_condition && element.action){
                    const action = element.action_condition.action
                    const args = element.action_condition.args
                    this.executeConditionAction(action, args, (ret: ConditionResponse)=>{
                        if(ret.ok){
                            actionFn();
                            if (close_modal && context.modal_id !== undefined){
                                this.modal_helper.popup(context.modal_id)
                            }
                        } else {
                            if(ret.message){
                                this.alert_helper.show(ret.message)
                            }
                        }

                    })
                } else if(element.action) {
                    actionFn()
                    if (close_modal && context.modal_id !== undefined){
                        this.modal_helper.popup(context.modal_id)
                    }
                }
                app_platform.logEvent(AnalyticsEventKind.button_event, {
                    route: this.page.route,
                    text: element.text
                })
            }
        })
    }

    renderIconButton(element: ButtonElement, context: RenderContext){
        const actionFn = () => {
            this.executeAction(element.action, element.args, context)
        }

        const style = this.tranformStyle(element.style ?? {})
        return h("icon_button", {
            text: element.text,
            icon: element.icon,
            ...style,
            color: element.style?.color ?? "surface",
            onClicked:() => {
                if(element.action){
                    if(element.show_ad){
                        this.ad_helper.showAdNow(element.show_ad as AdShowOptions, (ret: ConditionResponse) => {
                            if(ret.ok){
                                actionFn();
                            } else {
                                if(ret.message){
                                    this.alert_helper.show(ret.message)
                                }
                            }
                            if (context.modal_id !== undefined){
                                this.modal_helper.popup(context.modal_id)
                            }
                        })
                        app_platform.logEvent(AnalyticsEventKind.ad_show_event, {
                            name: "active",
                            route: this.page.route,
                            vendor: element.show_ad['ad_vendor'],
                            ad_type: element.show_ad['ad_type']
                        })
                    } else if (element.action_condition){
                        const action = element.action_condition.action
                        const args = element.action_condition.args
                        this.executeConditionAction(action, args, (ret: ConditionResponse)=>{
                            if(ret.ok){
                                actionFn();
                            } else {
                                if(ret.message){
                                    this.alert_helper.show(ret.message)
                                }
                            }
                            if (context.modal_id !== undefined){
                                this.modal_helper.popup(context.modal_id)
                            }

                        })
                    } else {
                        actionFn()
                    }
                }
                app_platform.logEvent(AnalyticsEventKind.button_event, {
                    route: this.page.route,
                    text: element.text
                })
            }
        })
    }

    renderProgressBar(element: ProgressBarElement, context: RenderContext){
        const props:Record<string, any> = {
        }
        if(element.percent !== undefined){
            props['percent'] = element.percent
        }

        if(element.value !== undefined && element.total !== undefined){
            props['value'] = element.value
            props['total'] = element.total
        }
        return h("progress_bar", {...props, ...element.style}, {})
    }

    renderAnnotationText(element: AnnotationTextObject, context: RenderContext) {
        return h("annotation_text", {text: element.text, annotation: element.annotation})
    }

    renderPlainText(element: PlainTextObject, context: RenderContext) {
        return h('plain_text', {"text": element.text})
    }

    renderRowLine(element: RowLineElement, context: RenderContext) {
        return h("row", {...element.style}, {
            default: () => {
                const nodes = []
                for(const el of element.elements){
                    nodes.push(this.renderElement(el, context))
                }
                return nodes
            }
        })
    }

    renderColumn(element: ColumnElement, context: RenderContext) {
        return h("column", {...element.style}, {
            default: () => {
                const nodes = []
                for(const el of element.elements){
                    nodes.push(this.renderElement(el, context))
                }
                return nodes
            }
        })
    }

    renderImage(element: ImageElement, context: RenderContext) {
        const args: any = {
            image_url: element.image_url
        }
        if (element.image_type){
            args.image_type = element.image_type
        }
        return h("image_view", {...args, ...element.style})
    }

    renderVideo(element: VideoElement, context: RenderContext) {
        const args: any = {
            video_url: element.video_url,
            poster_url: element.poster_url,
            aspect: element.aspect,
            autoplay: element.autoplay ?? false
        }
        if (element.video_type){
            args.video_type = element.video_type
        }
        return h("video_player", {...args, ...element.style})
    }

    renderModalWidget(element:ModalWidgetElement, context:RenderContext): object | undefined {
        if(!element){
            return undefined
        }
        if (element.type == 'separator') {
            return this.renderSeparator(element as SeparatorElement, context)
        } else if (element.type == 'title') {
            return this.renderTitle(element as TitleElement, context)
        } else if (element.type == 'link') {
            return this.renderLink(element as LinkElement, context)
        } else if (element.type == 'paragraph') {
            return this.renderParagraph(element as ParagraphElement, context)
        } else if (element.type == 'bulleted-list') {
            return this.renderBulletedList(element as BulletedListElement, context)
        } else if (element.type == 'button') {
            return this.renderButton(element as ButtonElement, context)
        } else if (element.type == 'icon-button') {
            return this.renderIconButton(element as ButtonElement, context)
        } else if (element.type == 'progress-bar') {
            return this.renderProgressBar(element as ProgressBarElement, context)
        } else if (element.type == 'star-rating') {
            return this.renderStarRating(element as StarRatingElement, context)
        } else if (element.type == 'icon') {
            return this.renderIcon(element as IconElement, context)
        } else if (element.type == 'icon-text') {
            return this.renderIconText(element as IconTextElement, context)
        } else if (element.type == 'icon-number') {
            return this.renderIconNumber(element as IconNumberElement, context)
        } else if (element.type == 'icon-title') {
            return this.renderIconTitle(element as IconTitleElement, context)
        } else if (element.type == 'annotation-text') {
            return this.renderAnnotationText(element as AnnotationTextObject, context)
        } else if (element.type == 'row') {
            return this.renderRowLine(element as RowLineElement, context)
        } else if (element.type == 'column') {
            return this.renderColumn(element as ColumnElement, context)
        } else if (element.type == 'plain-text') {
            return this.renderPlainText(element as PlainTextObject, context)
        } else if (element.type == 'image') {
            return this.renderImage(element as ImageElement, context)
        } else if (element.type == 'video') {
            return this.renderVideo(element as VideoElement, context)
        } else if (element.type == 'nav-menu') {
            return this.renderNavMenu(element as NavMenuElement, context)
        } else if (element.type == 'motion') {
        } else {
            console.warn(`not supported widget type ${element.type}`)
        }
    }

    renderModalElements(elements: ModalWidgetElement[], context:RenderContext): object[] {
        const nodes: object[] = []
        for(const element of elements){
            const el_node = this.renderModalWidget(element, context)
            if(el_node){
                nodes.push(el_node)
            }
        }
        return nodes
    }

    getModalOption(open_modal: ModalElement, context: RenderContext){
        const title_action = open_modal.title_action ?? undefined
        if(title_action !== undefined &&  Object.keys(title_action).length > 0){
            title_action.clicked = () => {
                this.executeAction(title_action.action, title_action.args, context)
            }
        }
        const modal_options:Record<string, any> = {
            title: open_modal.title,
            title_action: open_modal.title_action ?? undefined,
            ...(open_modal.style ?? {}),
            actionConfirmText: open_modal.confirm?.text,
            actionCancelText: open_modal.cancel?.text,
            onModalConfirmed: () => {
                if(open_modal.confirm?.action){
                    this.executeAction(open_modal.confirm.action, open_modal.confirm.args, context)
                }
                app_platform.logEvent(AnalyticsEventKind.button_event, {
                    route: this.page.route,
                    text: open_modal.confirm?.text ?? "confirm"
                })
            },
            onModalCancelled: () => {
                if(open_modal.cancel?.action){
                    this.executeAction(open_modal.cancel.action, open_modal.cancel.args, context)
                }
                app_platform.logEvent(AnalyticsEventKind.button_event, {
                    route: this.page.route,
                    text: open_modal.cancel?.text ?? "cancel"
                })
            }
        }
        if(open_modal.content){
            modal_options.text = open_modal.content
        }
        return modal_options
    }

    openModal(open_modal: ModalElement, args: Record<string, any>, context: RenderContext){
        const modal_id = this.modal_helper.new_modal_id()
        let sub_context = { ...context }
        sub_context.modal_id = modal_id

        let inplace = false
        if ('inplace' in args){
            inplace = args['inplace']
        }

        if(context.modal_id !== undefined){
            this.modal_helper.open_sub(
                {
                    modal_id: modal_id,
                    option: this.getModalOption(open_modal, context),
                    close_listeners: [],
                    slot_render: () => {
                        if(open_modal.elements){
                            return this.renderModalElements(open_modal.elements, sub_context)
                        }
                    }
                },
                context,
                inplace
            )
        } else {
            this.modal_helper.open(
                modal_id,
                this.getModalOption(open_modal, context),
                () => {
                    if(open_modal.elements){
                        return this.renderModalElements(open_modal.elements, sub_context)
                    }
                }
            )
        }

    }


    renderActionBar(element: ActionBarElement, context: RenderContext): object {
        const actions:IconActionDefinition[] = [];
        const app_core = AppCore.getCore(this.app_id)
        for(const el of element.elements){
            if(el.type === 'button'){
                const action = el as ActionElement
                actions.push({
                    name: action.text ?? 'default',
                    icon: app_core.full_link(action.icon) ?? '',
                    text: action.text,
                    count: action.count,
                    clicked: () => {
                        if(action.route) {
                            this.navigateTo(action.route, context)
                        } else if (action.open_modal){
                            this.openModal(action.open_modal, action.open_modal_args ?? {}, context)
                        } else if (action.action){
                            this.executeAction(action.action, action.args, context)
                        }

                        app_platform.logEvent(AnalyticsEventKind.button_event, {
                            route: this.page.route,
                            text: action.text
                        })

                    }
                })
            }
        }
        return h("action_bar", {actions: actions})
    }

    renderTableView(element: TableViewElement, context: RenderContext): object {
        return h("table_view", {
            columns: element.columns,
            showHeader: element.show?.header || false,
            showInnerColumn: element.show?.inner_column || false,
            showInnerRow: element.show?.inner_row || false,
            rows: element.rows,
            cellRender: (cell:any) => {
                const cell_element = cell as HolaElement;
                return this.renderElementOrList(cell_element, context)
            }
        })
    }

    renderCard(element: CardElement, context: RenderContext): object {
        return h("card", {
            title: element.title ?? "",
            text: element.text ?? "",
            image_src: element.image_src
        }, {
            default: () => {
                return this.renderElementOrList(element.elements, context)
            }
        })
    }

    renderCardSwiper(element: CardSwiperElement, context: RenderContext): object {
        return h("card_swiper", {
            title: element.title ?? "",
            cards: element.elements,
            cardRender: (card: any) => {
                return this.renderElementOrList(card, context)
            }
        })
    }

    renderHero(element: HeroElement, context: RenderContext): object {
        return h("hero", { title: element.title, text: element.text,
            image_src: element.image_src, annotation_text: element.element })
    }

    renderLogo(element: LogoElement, context: RenderContext): object {
        return h("logo", { text: element.text, image_src: element.image_src})
    }

    renderNavMenu(element: NavMenuElement, context: RenderContext): object {
        const style = element.style ?? {}
        const items: MenuItem[] = []
        const app_core = AppCore.getCore(this.app_id)
        for(const item of element.elements){
            items.push({
                text: item.text,
                sub_text: item.sub_text ?? "",
                disable: item.disable ?? false,
                disable_text: item.disable_text ?? "",
                icon: app_core.full_link(item.icon),
                clicked: async () => {
                    if(item.route !== undefined){
                        this.navigateTo(item.route, context)
                    } else if(item.open_url){
                        app_platform.openUrl(item.open_url)
                    } else if(item.open_modal) {
                        const app_core = AppCore.getCore(this.app_id)
                        const modal = item.open_modal
                        const modal_id = this.modal_helper.new_modal_id()
                        const modal_updater = this.modal_helper.open(
                            modal_id,
                            {title:modal.title, actionConfirmText:modal.confirm?.text ?? ''}
                        )
                        if(modal.content_link){
                            try {
                                const html_content = await app_core.getContent(modal.content_link)
                                modal_updater.update({content_html: html_content})
                            } catch {
                                console.log('fetch html error.')
                                this.alert_helper.show(i18next.t('unable_connect_to_server'))
                            }
                        }

                    }
                    app_platform.logEvent(AnalyticsEventKind.button_event, {
                        route: this.page.route,
                        text: item.text
                    })
                }
            })
        }
        return h("navmenu", {...style, items: items})
    }

    renderElementOrList(element: HolaElement | HolaElement[], context: RenderContext): object | object[] | undefined{
        if(Array.isArray(element)){
            const elements:object[] = []
            for(const el of element){
                const rendered = this.renderElement(el, context)
                if(rendered){
                    elements.push(rendered)
                }
            }
            return elements
        }else{
            return this.renderElement(element, context)
        }
    }

    renderElement(element: HolaElement, context: RenderContext): object | undefined {
        if (element.type === "navbar") {
            return this.renderNavBar(element as NavBarElement, context)
        } else if (element.type === "header") {
            return this.renderHeader(element as HeaderElement, context)
        } else if (element.type === "footer") {
            return this.renderFooter(element as FooterElement, context)
        } else if (element.type === "logo") {
            return this.renderLogo(element as LogoElement, context)
        } else if (element.type === "hero") {
            return this.renderHero(element as HeroElement, context)
        } else if (element.type === "nav-menu") {
            return this.renderNavMenu(element as NavMenuElement, context)
        } else if (element.type === "decoration") {
        } else if (element.type === "motion") {
        } else if (element.type === "playable") {
        } else if (element.type === "action-bar") {
            return this.renderActionBar(element as ActionBarElement, context)
        } else if (element.type === "table-view") {
            return this.renderTableView(element as TableViewElement, context)
        } else if (element.type === "card") {
            return this.renderCard(element as CardElement, context)
        } else if (element.type === "card-swiper") {
            return this.renderCardSwiper(element as CardSwiperElement, context)
        } else {
            return this.renderModalWidget(element as ModalWidgetElement, context)
        }
    }

    renderPage(): object[] {
        const children: object[] = []
        for (const element of this.page.elements) {
            const context = {
                route: this.page.route,
                modal_id: undefined
            }
            const rendered = this.renderElement(element, context)
            if(rendered){
                children.push(rendered)
            }
        }
        // return h('div', { class: ["page"] }, undefined, [...children])
        return children;
    }

    renderAdditional(): object[] {
        const children: object[] = []
        const modelNode2 = this.modal_helper.render()
        if (modelNode2) {
            children.push(modelNode2)
        }

        //children.push(this.alert_helper.render())
        const app_core = AppCore.getCore(this.app_id)
        if(this.loading){
            children.push(h("loader"))
        }
        return children
    }

    render() {
        this.elements = [...this.renderPage(), ...this.renderAdditional()]
    }
}