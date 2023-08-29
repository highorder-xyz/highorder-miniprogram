<template>
    <view class="h-logo" :class="$props.class">
        <image class="h-logo-image" :src="$props.image_src" mode="aspectFit"></image>
        <view class="h-logo-title"><text>{{ $props.text }}</text></view>
    </view>
    
</template>

<script>
    export default {
        name: 'h-logo',
        props: {
            text: {
                type: String,
                default: ''
            },
            image_src: {
                type: String,
                default: ''
            },
            class: {
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
    .h-logo {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 4px;
    }
    
    .h-logo-image {
        width: 48px;
        height: 48px;
        margin-right: 8px;
    }
    
    .h-logo-title {
        font-weight: bold;
    }
</style>