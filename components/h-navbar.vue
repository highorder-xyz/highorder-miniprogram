<template>
    <view>
        <view class="h-navbar" :class="$props.class">
            <view class="title"><text>{{ $props.title }}</text></view>
        </view>
        <view class="h-navbar-placeholder">
        </view>
    </view>
</template>

<script>
    export default {
        name: 'h-navbar',
        props: {
            title: {
                type: String,
                default: ''
            },
            showBack: {
                type: Boolean,
                default: false
            },
            showHome: {
                type: Boolean,
                default: false
            }
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
    .h-navbar{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        background: #f7f7f7;
        border-style: solid;
        border-color: rgba(0, 0, 0, 0.2);
        border-width: 0 0 0.55px;
        color: rgba(0, 0, 0, 0.87);
        height: 32px;
        top: 0px;
        left: 0px;
        right: 0px;
        position: fixed;
        margin-bottom: 8px;
        padding-top: var(--status-bar-height);
        padding-bottom: 4px;
    }
    
    .h-navbar-placeholder{
        width: 100vw;
        height: 32px;
        margin-bottom: 8px;
        padding-top: var(--status-bar-height);
        padding-bottom: 4px;
    }
    
    .h-navbar .title {
        font-weight: bold;
    }
</style>