<template>
    <view class="content">
        <template v-for="(element, index) in page.elements" :key="index">
            <Element v-if="element.is_container == false" :key="index" :name="element.name" :props="element.props">
            </Element>
            <template v-if="element.is_container == true" :key="index">
                <h-column v-if="element.name=='column'" :key="index" v-bind="element.props" :class="element.props.class">
                    <template v-for="(element, index) in element.props.elements" :key="index">
                        <Element v-if="element.is_container == false" :key="index" :name="element.name" :props="element.props">
                        </Element>
                    </template>
                </h-column>
            </template>
        </template>
        
    </view>
    <slot></slot>
</template>

<script>
    import Element from './element';
    import HColumn from '../components/h-column'
    import { appGlobal, AppCore } from '@/core';
    import {
        startup,
        PageRender
    } from '@/render';
    
    export default {
        components: {
            Element,
            HColumn
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
                    console.log('render page')
                    const _page = PageRender.getPageRender(this.app_id)
                    console.log(_page.elements)
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
        justify-content: flex-start;
        width: 100vw;
        height: 100vh;
    }
</style>