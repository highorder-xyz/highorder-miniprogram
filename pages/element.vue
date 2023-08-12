<template>
    <h-image v-if="$props.name=='image'" v-bind="$props.props"></h-image>
</template>

<script>
    import HImage from '../components/h-image'
    export default {
        name: 'element',
        components: {
            HImage
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