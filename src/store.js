import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		user: false,
		firebase: null
	},
	mutations: {
		setUser (state, value) {
			state.user = value;
		},
		setFirebase (state, value) {
			state.firebase = value;
		},
	},
});