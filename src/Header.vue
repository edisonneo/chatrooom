<template>
	<div id="header">
		<!-- <img src="assets/logo.png"> -->
		<h1>{{ msg }}</h1>
		<input type="email" name="email" id='email'>
		<input type="password" name="password" id='password'>
		<button @click='login'> Log In </button>
		<button @click='signup'> Sign Up </button>
		<button v-if='loggedIn' @click='logout'> Log Out </button>
		<pre>Logged In? {{ loggedIn }}</pre>
		<!-- <button @click='pushToDb("asdds")'> PUSH </button> -->
		
	</div>
</template>

<script>

import * as Firebase from 'firebase'


export default {
	name: 'header',
	data() {
		return {
			msg: 'Chatrooom',
			room: null,
			precision: 6, // default precision
			db: null, // assign Firebase SDK later,
			auth: null,
			loggedIn: false
		}
	},
	mounted () {
	    // init the database client by given Firebase's API key
	    this.db = Firebase.initializeApp({
	        apiKey: 'AIzaSyAGd3Ivm0HgTVF4y5HHhQKjdm0FyMzzcuE',
	        authDomain: 'chatrooom-f07b5.firebaseapp.com',
	        databaseURL: 'https://chatrooom-f07b5.firebaseio.com'
	    })

	    this.auth = this.db.auth();

	    this.authState();
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
			var email = document.getElementById('email').value;
			var password = document.getElementById('password').value;

			var promise = this.auth.createUserWithEmailAndPassword(email, password);
			promise.catch(e => console.log(e.message));			
		},
		logout(){
			this.auth.signOut();
			this.loggedIn = false;
		},
		authState(){
			var vm = this;
			var auth = this.db.auth();
			auth.onAuthStateChanged(firebaseUser =>{
				if(firebaseUser){
					console.log(firebaseUser)
					console.log('yes log in');
					this.loggedIn = true;
				}
				else{
					console.log('no log in');
				}
			})
		}
		
	}
}
</script>

<style lang="scss">
body{
	background: #f9f9f9;
}
#header {
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
