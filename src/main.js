import Vue from 'vue'
import Router from 'vue-router'
import App from './App.vue'
import Chat from './Chat.vue'


Vue.use(Router)

const Foo = { template: '#chat' }
const Bar = { template: '<div>bar</div>' }

const routes = [
  { path: '/foo', component: Chat },
  { path: '/bar', component: Bar }
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

// new Vue({
// 	// router,
//   	el: '#chat',
//   	render: h => h(Chat),
// })
