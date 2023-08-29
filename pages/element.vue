<template>
    <h-image v-if="$props.name=='image'" v-bind="$props.props"></h-image>
    <h-card v-if="$props.name=='card'" v-bind="$props.props"></h-card>
    <h-header v-if="$props.name=='header'" v-bind="$props.props"></h-header>
    <h-footer v-if="$props.name=='footer'" v-bind="$props.props"></h-footer>
    <h-hero v-if="$props.name=='hero'" v-bind="$props.props"></h-hero>
    <h-logo v-if="$props.name=='logo'" v-bind="$props.props"></h-logo>
    <h-navbar v-if="$props.name=='navbar'" v-bind="$props.props"></h-navbar>
    <h-action-bar v-if="$props.name=='action_bar'" v-bind="$props.props">
        <template v-if="$props.elements && Object.keys($props.elements).length > 0">
            <Element v-for="(element, index) in $props.elements.default"
                :key="index" 
                :name="element.name"
                :props="element.props"
                :elements="element.elements">
            </Element>
        </template>
    </h-action-bar>
    <h-column v-if="$props.name=='column'" v-bind="$props.props" :class="$props.props.class">
        <template v-if="$props.elements && Object.keys($props.elements).length > 0">
            <Element v-for="(element, index) in $props.elements.default"
                :key="index" 
                :name="element.name"
                :props="element.props"
                :elements="element.elements">
            </Element>
        </template>
    </h-column>
</template>

<script>
    import HImage from '../components/h-image'
    import HCard from '../components/h-card'
    import HHeader from '../components/h-header'
    import HFooter from '../components/h-footer'
    import HHero from '../components/h-hero'
    import HColumn from '../components/h-column'
    import HNavbar from '../components/h-navbar'
    import HActionBar from '../components/h-action-bar'
    import HLogo from '../components/h-logo'
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
            HNavbar,
            HActionBar,
            HLogo,
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