<template>
    <view class="h-hero" :class="$props.class">
        <view class="title"><text>{{ $props.title }}</text></view>
        <view class="paragraph"><text>{{ $props.text }}</text></view>
    </view>
</template>

<script>
    export default {
        name: 'h-hero',
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
    .h-hero{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        color: rgba(0, 0, 0, 0.87);
        width: 100vw;
        margin-top: 4px;
        margin-bottom: 12px;
        padding: 16px 8px;
    }
    
    .h-hero .title {
        font-weight: bold;
        line-height: 24px;
        margin-bottom: 12px;
        max-width: 80vw;
    }
    
    .h-hero .paragraph {
        line-height: 18px;
        font-size: 14px;
        color: #777777;
        max-width: 80vw;
    }
</style>