<template>
    <template v-if="$props.is_container == false">
        <h-image v-if="$props.name=='image'" v-bind="$props.props"></h-image>
    </template>
    <template v-if="$props.is_container == true">
        <h-column v-if="$props.name=='column'" v-bind="$props.props" :class="$props.props.class">
            <template v-if="$props.props.elements">
                <Element v-for="(element, index) in $props.props.elements"
                    :key="index" 
                    :name="element.name"
                    :is_container="element.is_container"
                    :props="element.props">
                </Element>
            </template>
        </h-column>
    </template>
</template>

<script>
    import HImage from '../components/h-image'
    import HColumn from '../components/h-column'
    import Element from './element'
    export default {
        name: 'element',
        components: {
            HImage,
            HColumn,
            Element
        },
        created() {
          console.log('element created with props:', this.$props)  
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