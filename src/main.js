import Vue from 'vue'
import VueFire from 'vuefire'
import Router from 'vue-router'
import Home from './components/Home.vue'
import Room from './components/Room.vue'
import store from './store.js'


import App from './App.vue'


Vue.use(Router)
Vue.use(VueFire)


const routes = [
  { path: '/', name: 'home', component: Home ,props: true},
  { path: '/rooms/:roomId', name: 'rooms', component: Room, props: true},
]

const router = new Router({
  mode: 'history',
  routes // short for `routes: routes`
})


new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App),
})

