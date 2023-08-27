<template>
    <h-image v-if="$props.name=='image'" v-bind="$props.props"></h-image>
    <h-card v-if="$props.name=='card'" v-bind="$props.props"></h-card>
    <h-header v-if="$props.name=='header'" v-bind="$props.props"></h-header>
    <h-footer v-if="$props.name=='footer'" v-bind="$props.props"></h-footer>
    <h-hero v-if="$props.name=='hero'" v-bind="$props.props"></h-hero>
    <template v-if="$props.elements && Object.keys($props.elements).length > 0">
        <h-column v-if="$props.name=='column'" v-bind="$props.props" :class="$props.props.class">
            <Element v-for="(element, index) in $props.elements.default"
                :key="index" 
                :name="element.name"
                :props="element.props"
                :elements="element.elements">
            </Element>
        </h-column>
    </template>
</template>

<script>
    import HImage from '../components/h-image'
    import HCard from '../components/h-card'
    import HHeader from '../components/h-header'
    import HFooter from '../components/h-footer'
    import HHero from '../components/h-hero'
    import HColumn from '../components/h-column'
    import Element from './element'
    export default {
        name: 'element',
        components: {
            HImage,
            HCard,
            HHeader,
            HHero,
            HFooter,
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