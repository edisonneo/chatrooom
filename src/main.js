import Vue from 'vue'
import VueFire from 'vuefire'
import Router from 'vue-router'
import App from './App.vue'
import Home from './Home.vue'
import Room from './Room.vue'
import Chat from './Chat.vue'


Vue.use(Router)
Vue.use(VueFire)


const routes = [
  { path: '/', component: Home ,props: true},
  { path: '/rooms/:roomId', name: 'rooms', component: Room, props: true},
  { path: '/chat', component: Chat, props: true}
]

const router = new Router({
  mode: 'history',
  routes // short for `routes: routes`
})


new Vue({
  el: '#app',
  router,
  render: h => h(App),
})

