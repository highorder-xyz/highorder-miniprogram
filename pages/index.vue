<template>
    <view class="content">
        <Element v-for="(element, index) in page.elements" :key="index" 
            :is_container="element.is_container"
            :name="element.name"
            :props="element.props">
        </Element>
    </view>
</template>

<script>
    import Element from './element';
    import { appGlobal, AppCore } from '@/core';
    import {
        startup,
        PageRender
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
                if(this.app_id !== undefined && this.app_id !== ""){
                    const _page = PageRender.getPageRender(this.app_id)
                    return _page
                }
                return {
                    "elements":[]
                }
            }
        },
        created(){
            startup().then(() => {
                let app_core = AppCore.getCore(appGlobal.app_id)
                this.app_id = appGlobal.app_id
                console.log('session start')
                this.page.sessionStart()
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
        justify-content: flex-start;
        width: 100vw;
        height: 100vh;
    }
</style>