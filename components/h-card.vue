<template>
    <view class="h-card" :class="$props.class">
        <view class="title"><text>{{ $props.title }}</text></view>
        <view class="paragraph"><text>{{ $props.text }}</text></view>
        <slot></slot>
    </view>
</template>

<script>
    export default {
        name: 'h-card',
        props: {
            title: {
                type: String,
                default: ''
            },
            text: {
                type: String,
                default: ''
            },
            image_src: {
                type: String,
                default: ''
            },
        },
        data() {
            return {}
        },
        onLoad() {
        },
        methods: {
        }
    }
</script>

<style>
    .h-card{
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        background: #ffffff;
        color: rgba(0, 0, 0, 0.87);
        box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12);
        border-radius: 4px;
        width: 92vw;
        margin-top: 4px;
        margin-bottom: 12px;
        padding: 16px 8px;
    }
    
    .h-card .title {
        font-weight: bold;
        line-height: 24px;
        margin-bottom: 12px;
    }
    
    .h-card .paragraph {
        line-height: 18px;
        font-size: 14px;
        color: #777777;
    }
</style>