import Vue from 'vue'
import Header from './Header.vue'
import Chat from './Chat.vue'

new Vue({
  el: '#header',
  render: h => h(Header),
})

new Vue({
  el: '#chat',
  render: h => h(Chat),
})
