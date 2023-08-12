<template>
    <view class="content">
        <Element v-for="(element, index) in page.elements" :key="index" :name="element.name" :props="element.props" :class="element.class">
        </Element>
    </view>
    <slot></slot>
</template>

<script>
    import Element from './element';
    import { appGlobal, AppCore } from '@/core';
    import {
        startup,
        PageRender,
        init_page
    } from '@/render';
    
    export default {
        components: {
            Element
        },
        data() {
            let app_id = appGlobal.app_id
            return {
                app_id: app_id
            }
        },
        computed:{
            page() {
                // if(this.app_id !== undefined && this.app_id !== ""){
                    // console.log('render page')
                    // return PageRender.getPageRender(this.app_id)
                // }
                console.log(init_page)
                return init_page
            }
        },
        created(){
            startup().then(() => {
                let app_core = AppCore.getCore(appGlobal.app_id)
                this.app_id = appGlobal.app_id
                console.log('session start')
                // this.page.sessionStart()
            })
        },
        onLoad() {
        },
        methods: {

        }
    }
</script>

<style>
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
</style>