<template>
  <q-page padding class="relative dark">
    <div style="with:100%; text-align:center">
      On this page you may customize the colors used by the bKit GUI
    </div>
    <button @click="darkThemeSwitch">Switch Theme</button>
    <div class="full with row justify-center">
    <q-toggle v-model="texto" left-label label="w/b"/>
    <q-toggle v-model="fgbg" rigth-label label="fb/bg" />
  </div>
    <q-select v-model="chooseop" :options="choose"
      style="max-width: 23em"
      label="If you want you may switch to another pickup color" />
    <div class="row no-wrap items-stretch q-mt-lg">
      <div style="min-width:50%" class="row items-center justify-center nodark">
        <Photoshop @input="change" v-model="color"
          v-if="chooseop === 'Photoshop'"/>
        <Material @input="change" v-model="color"
          v-if="chooseop === 'Material'"/>
        <Chrome @input="change" v-model="color"
          v-if="chooseop === 'Chrome'"/>
        <Compact @input="change" v-model="color"
          v-if="chooseop === 'Compact'"/>
        <Sketch @input="change" v-model="color"
          v-if="chooseop === 'Sketch'"/>
        <Slider @input="change" v-model="color"
          v-if="chooseop === 'Slider'"/>
      </div>
      <div class="q-pa-md q-ml-lg">
       <div style="with:100%; text-align:center" class="dark">Select the color that you want to change</div>
       <q-chip v-for="option in options" :key="option.value"
        :label="option.label"
        :selected="bgcolor === option.value"
        style="cursor:pointer;min-width: 140px"
        @click.native="setcolor(option.value)"
        inline dense
        class="q-pa-md q-ml-lg centrado"
        :text-color="fgbg ? option.color : fgcolor"
        :color="fgbg ?  fgcolor : option.color"/>
        </div>
    </div>
  </q-page>
</template>

<script>

// import fs from 'fs'

import { colors } from 'quasar'
import { Photoshop, Material, Chrome, Compact, Sketch, Slider } from 'vue-color'

export default {
  name: 'Customize',
  data () {
    return {
      fgbg: false,
      texto: false,
      color: '',
      valor: '',
      chooseop: 'Photoshop',
      cores: ['ok', 'error'],
      bgcolor: 'ok',

      options: [
        { label: 'ok', value: 'ok', color: 'ok' },
        { label: 'error', value: 'error', color: 'error' },
        { label: 'bkit', value: 'bkit', color: 'bkit' },
        { label: 'fg', value: 'fg', color: 'fg' },
        { label: 'bg', value: 'bg', color: 'brown' },
        { label: 'alarm', value: 'alarm', color: 'alarm' },
        { label: 'danger', value: 'danger', color: 'danger' },
        { label: 'warning', value: 'warning', color: 'warning' },
        { label: 'cancel', value: 'cancel', color: 'cancel' },
        { label: 'done', value: 'done', color: 'done' },
        { label: 'missing', value: 'missing', color: 'missing' },
        { label: 'active', value: 'active', color: 'active' },
        { label: 'updated', value: 'updated', color: 'updated' },
        { label: 'modified', value: 'modified', color: 'modified' },
        { label: 'new', value: 'new', color: 'new' },
        { label: 'nobackup', value: 'nobackup', color: 'nobackup' },
        { label: 'deleted', value: 'deleted', color: 'deleted' },
        { label: 'filtered', value: 'filtered', color: 'filtered' },
        { label: 'unchecked', value: 'unchecked', color: 'unchecked' },
        { label: 'included', value: 'included', color: 'included' },
        { label: 'excluded', value: 'excluded', color: 'excluded' },
        { label: 'folder', value: 'folder', color: 'folder' },
        { label: 'file', value: 'file', color: 'file' },
        { label: 'checkbox', value: 'checkbox', color: 'checkbox' },
        { label: 'button', value: 'button', color: 'button' },
        { label: 'backup', value: 'backup', color: 'backup' },
        { label: 'reset', value: 'reset', color: 'reset' },
        { label: 'restore', value: 'restore', color: 'restore' },
        { label: 'recover', value: 'recover', color: 'recover' },
        { label: 'loader', value: 'loader', color: 'loader' },
        { label: 'openclose', value: 'openclose', color: 'openclose' },
        { label: 'path', value: 'path', color: 'path' },
        { label: 'path-sep', value: 'path-sep', color: 'path-sep' },
        { label: 'selected', value: 'selected', color: 'selected' },
        { label: 'versions', value: 'versions', color: 'versions' },
        { label: 'noversions', value: 'noversions', color: 'noversions' },
        { label: 'badger', value: 'badger', color: 'badger' },
        { label: 'badger-1', value: 'badger-1', color: 'badger-1' },
        { label: 'badger-2', value: 'badger-2', color: 'badger-2' },
        { label: 'badger-3', value: 'badger-3', color: 'badger-3' },
        { label: 'chip', value: 'chip', color: 'chip' },
        { label: 'chip-1', value: 'chip-1', color: 'chip-1' },
        { label: 'chip-2', value: 'chip-2', color: 'chip-2' },
        { label: 'chip-3', value: 'chip-3', color: 'chip-3' },
        { label: 'console', value: 'console', color: 'console' },
        { label: 'console-border', value: 'console-border', color: 'console-border' }
      ],
      choose: [
        'Chrome',
        'Compact',
        'Material',
        'Photoshop',
        'Sketch',
        'Slider'
      ]
    }
  },
  computed: {
    fgcolor () {
      return this.texto ? 'black' : 'white'
    }
  },
  components: {
    Photoshop: Photoshop,
    Material: Material,
    Chrome: Chrome,
    Compact: Compact,
    Sketch: Sketch,
    Slider: Slider
  },
  methods: {
    change () {
      console.log('color', this.color)
      colors.setBrand(this.bgcolor, this.color.hex)
    },
    setcolor (val) {
      this.bgcolor = val
    },
    _addDarkTheme () {
      let darkThemeLinkEl = document.createElement('link')
      darkThemeLinkEl.setAttribute('rel', 'stylesheet')
      darkThemeLinkEl.setAttribute('href', 'statics/darktheme.css')
      darkThemeLinkEl.setAttribute('type', 'text/css')
      darkThemeLinkEl.setAttribute('id', 'dark-theme-style')

      let docHead = document.querySelector('head')
      docHead.append(darkThemeLinkEl)
    },
    _removeDarkTheme () {
      let darkThemeLinkEl = document.querySelector('#dark-theme-style')
      let parentNode = darkThemeLinkEl.parentNode
      parentNode.removeChild(darkThemeLinkEl)
    },
    darkThemeSwitch () {
      let darkThemeLinkEl = document.querySelector('#dark-theme-style')
      if (!darkThemeLinkEl) {
        this._addDarkTheme()
      } else {
        this._removeDarkTheme()
      }
    }

  },
  async mounted () {
  }
}
</script>
<style type="text/css">
.centrado .ellipsis {
  width: 100%;
  text-align: center;
}
</style>
