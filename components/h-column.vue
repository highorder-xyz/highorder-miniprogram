<template>
    <view :class="$props.class" class="h-column">
        <slot></slot>
    </view>
</template>

<script>
    export default {
        name: 'h-column',
        props: {
        },
        created() {
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
    .h-column{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
</style>