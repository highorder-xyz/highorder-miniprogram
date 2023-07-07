<template>
    <view class="content">
        <Element v-for="(element, index) in page.elements" :key="index" :name="element.name" :props="element.props">
        </Element>
    </view>
    <slot></slot>
</template>

<script>
    import Element from './element';
    import {
        page
    } from '../core';

    export default {
        components: {
            Element
        },
        data() {
            return {
                page: page
            }
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