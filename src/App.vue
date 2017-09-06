<template>
	<div id="app">
		<h1><a @click='goHome'>{{ title }}</a></h1>
		<h2 v-if="room && !user">Sign up with an email to join the chat room!</h2>
		
		<input v-if='!user' type="email" name="email" id='email'>
		<input v-if='!user'type="password" name="password" id='password'>
		<button v-if='!user' @click='login'> Log In </button>
		<button v-if='!user' @click='signup'> Sign Up </button>
		<button v-if='user' @click='logout'> Log Out </button>
		<h4 v-if='user'>{{ user.email }}</h4>
		
    	<router-view v-if="user" :authenticate="auth"></router-view>


	</div>
</template>

<script>

import * as Firebase from 'firebase'
import { mapState } from 'vuex';

var firebaseApp = Firebase.initializeApp({
        apiKey: 'AIzaSyAGd3Ivm0HgTVF4y5HHhQKjdm0FyMzzcuE',
        authDomain: 'chatrooom-f07b5.firebaseapp.com',
        databaseURL: 'https://chatrooom-f07b5.firebaseio.com'
    })

var db = firebaseApp.database();
var auth = firebaseApp.auth();

export default {
	name: 'app',
	firebase() {
		return{
			// simple syntax, bind as an array by default
    		
		}
	},
	data() {
		return {
			title: 'Chatrooom',
			room: false,
			precision: 6, // default precision
			db: db, // assign Firebase SDK later,
			auth: auth,
			welcome: 'ASDASDASDADSSD',
		}
	},
	computed:{ 
		...mapState(['user']),
    },
	beforeCreate () {
		
		this.$store.commit('setFirebase', firebaseApp || false);        
		
		auth.onAuthStateChanged((user) => {
        	// initially user = null, after auth it will be either <fb_user> or false
        	this.$store.commit('setUser', user || false);
      });
    },
	created(){
	 	var path = this.$route.path;   
	 	if(path.indexOf('rooms') !== -1){
	 		this.room = true;
	 	}
	 	else{
	 		this.room = false;
	 	}
	},
	mounted () {
	    
	},
	methods: {
		testing(){
			console.log('test');
		},
		pushToDb(val){
			this.db.database().ref().push().set(val)
		},
		login(){
			// var provider = this.db.auth.GoogleAuthProvider();
			var email = document.getElementById('email').value;
			var password = document.getElementById('password').value;

			var promise = this.auth.signInWithEmailAndPassword(email, password);
			promise.catch(e => console.log(e.message))

		},
		signup(){
			var vm = this;
			var email = document.getElementById('email').value;
			var password = document.getElementById('password').value;

			var promise = this.auth.createUserWithEmailAndPassword(email, password);
			promise.then(user =>{
				vm.db.ref().child("users").child(user.uid).set({
		      		email: user.email,
		        });
			});
			promise.catch(e => {
				console.log(e.message);
				
			});			
		},
		logout(){
			this.auth.signOut();
			this.loggedIn = false;
		},
		goHome(){
			var router = this.$router;
			router.push('/');
		}
		
	}
}
</script>

<style lang="scss">
body{
	background: #f9f9f9;
}
#app {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}

h1, h2 {
	font-weight: normal;
}

ul {
	list-style-type: none;
	padding: 0;
}

li {
	display: inline-block;
	margin: 0 10px;
}

a {
	color: #42b983;
}
</style>
