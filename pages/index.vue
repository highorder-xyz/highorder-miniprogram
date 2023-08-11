<template>
    <view class="content">
        <Element v-for="(element, index) in page.elements" :key="index" :name="element.name" :props="element.props">
        </Element>
    </view>
    <slot></slot>
</template>

<script>
    import Element from './element';
    import { appGlobal, AppCore } from '@/core';
    import {
        PageRender
    } from '@/app_render';
    
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
                if(this.app_id !== undefined){
                    return PageRender.getPageRender(this.app_id)
                }
                return {
                    "elements": []
                }
            }
        },
        created(){
            let app_core = AppCore.getCore(this.app_id)
            console.log('session start')
            // this.page.sessionStart()
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

    .logo {
        height: 200rpx;
        width: 200rpx;
        margin-top: 200rpx;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 50rpx;
    }

    .text-area {
        display: flex;
        justify-content: center;
    }

    .title {
        font-size: 36rpx;
        color: #8f8f94;
    }
</style>