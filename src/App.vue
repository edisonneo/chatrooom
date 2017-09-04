<template>
	<div id="app">
		<h1>{{ msg }}</h1>

		<input type="email" name="email" id='email'>
		<input type="password" name="password" id='password'>
		<button v-if='!loggedIn' @click='login'> Log In </button>
		<button @click='signup'> Sign Up </button>
		<button v-if='loggedIn' @click='logout'> Log Out </button>
		<h4 v-if='loggedIn && currentUser'>{{ currentUser.email }}</h4>
		<pre>Logged In? {{ loggedIn }}</pre>
		<!-- <pre>{{ currentUser }}</pre> -->
		<!-- <button @click='pushToDb("asdds")'> PUSH </button> -->
		

		<!-- <router-link to="/">Home</router-link> -->
    	<!-- <router-link to="/chat">Chat</router-link> -->
		
    	<router-view :database="db" :authenticate="auth" :user="currentUser"></router-view>


	</div>
</template>

<script>

import * as Firebase from 'firebase'

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
			msg: 'Chatrooom',
			room: null,
			precision: 6, // default precision
			db: db, // assign Firebase SDK later,
			auth: auth,
			loggedIn: false,
			welcome: 'ASDASDASDADSSD',
			currentUser: null
		}
	},
	created(){
		// init the database client by given Firebase's API key
	    // this.db = Firebase.initializeApp({
	    //     apiKey: 'AIzaSyAGd3Ivm0HgTVF4y5HHhQKjdm0FyMzzcuE',
	    //     authDomain: 'chatrooom-f07b5.firebaseapp.com',
	    //     databaseURL: 'https://chatrooom-f07b5.firebaseio.com'
	    // })

	    // this.auth = this.db.auth();

	    this.authState();
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
		authState(){
			var vm = this;
			var auth = this.auth;
			auth.onAuthStateChanged(firebaseUser =>{
				if(firebaseUser){
					// console.log(firebaseUser)
					console.log('yes log in');
					this.loggedIn = true;
					vm.currentUser = firebaseUser;
				}
				else{
					vm.currentUser = null;
					console.log('no log in');
				}
			})
		},
		createNewRoom(){
			console.log('create new room')
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
