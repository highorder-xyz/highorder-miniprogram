<template>
    <view>
        <view class="h-action-bar" :class="$props.class">
            <slot></slot>
        </view>
        <view class="h-action-bar-placeholder">
        </view>
    </view>
</template>

<script>
    export default {
        name: 'h-action-bar',
        props: {
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
    .h-action-bar{
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        justify-content: center;
        background: #f7f7f7;
        border-style: solid;
        border-color: rgba(0, 0, 0, 0.2);
        border-width: 0.55px 0 0;
        color: rgba(0, 0, 0, 0.87);
        height: 44px;
        left: 0px;
        bottom: 0px;
        right: 0px;
        position: fixed;
        margin-top: 8px;
    }
    
    .h-action-bar-placeholder{
        width: 100vw;
        height: 44px;
        margin-top: 8px;
    }
</style>