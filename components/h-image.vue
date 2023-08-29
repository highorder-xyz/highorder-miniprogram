<template>
    <image :class="$props.class" class="h-image-view" :src="$props.src" :mode="$props.mode"></image>
</template>

<script>
    export default {
        name: 'h-image',
        props: {
            src: {
                type: String,
                default: ''
            },
            mode: {
                type: String,
                default: 'aspectFit'
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
</style>