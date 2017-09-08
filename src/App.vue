<template>
	<div id="app">
		<div class="notification-bar">
			<section id="notificationBar">
			</section>
		</div>
		<div class="nav">
			<div class='wrapper'>
				<div class="nav__top">
					<h1><a @click='goHome'>{{ title }}</a></h1>
					<h4 v-if='user'>{{ user.email }}</h4>
					<button v-if='user'  @click='logout'> Log Out </button>					
				</div>
				<div class="nav__bottom">
					<input v-if='!user' type="email" name="email" id='email' placeholder="Email">
					<input v-if='!user'type="password" name="password" id='password' placeholder="Password">
					<button v-if='!user' @click='login'> Log In </button>
					<button v-if='!user' @click='signup'> Sign Up </button>	
					<p :class="warningState ? 'show':'' " id='navWarning'></p>
					<h2 v-if="room && !user">Sign up with an email to join the chat room!</h2>		
				</div>
			</div>
		</div>	
		<div class="page-wrapper">
			
			<router-view v-if="user" :authenticate="auth"></router-view>	
		</div>
    	


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
			warningState: false,
			warningEl: null
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
	 	this.checkIfRoom();
	},
	updated(){

	},
	mounted () {
	    this.$nextTick(function(){
	    	this.warningEl = document.getElementById('navWarning');
	    });
	},
	watch:{
		'$route': function(){
			this.checkIfRoom();
		}
	},
	methods: {
		testing(){
			console.log('test');
		},
		checkIfRoom(){
			var path = this.$route.path;   
		 	if(path.indexOf('rooms') !== -1){
		 		this.room = true;
		 	}
		 	else{
		 		this.room = false;
		 	}
		},
		pushToDb(val){
			this.db.database().ref().push().set(val)
		},
		login(){
			var vm = this;
			// var provider = this.db.auth.GoogleAuthProvider();
			var email = document.getElementById('email').value;
			var password = document.getElementById('password').value;

			var promise = this.auth.signInWithEmailAndPassword(email, password);
			promise.then(res=>{
				vm.warningState = false;
				vm.openNotification('Welcome '+ res.email, "success")

			}).catch(e => {
				console.log(e.message)
				vm.warningEl.innerHTML = e.message;
				// vm.warningState = true;
				vm.openNotification(e.message, "warning", 2000)
			})

		},
		signup(){
			var vm = this;
			var email = document.getElementById('email').value;
			var password = document.getElementById('password').value;

			var promise = this.auth.createUserWithEmailAndPassword(email, password);
			promise.then(user =>{
				vm.warningState = false;
				vm.db.ref().child("users").child(user.uid).set({
		      		email: user.email,
		        });
		        vm.openNotification('Account '+ user.email + ' has been created!', 'success');
			});
			promise.catch(e => {
				vm.openNotification(e.message, "warning", 2000)
				
			});			
		},
		logout(){
			this.auth.signOut();
			this.loggedIn = false;
		},
		goHome(){
			var router = this.$router;
			router.push('/');
		},
		openNotification(text, type, time){
			if(time == null){
				time = 4000; 
			}
			var bar = document.getElementById('notificationBar');
			bar.className = 'isOpen ' + type;
			bar.innerHTML = text;

			setTimeout(function(){
				bar.className = '';
				bar.innerHTML = '';
			}, time)
		},
		
	}
}
</script>

<style lang="scss">

$orange: #f89414;

$tablet-width: 768px;
$desktop-width: 1024px;

@mixin phone {
  @media (max-width: #{$tablet-width - 1px}) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: #{$tablet-width}) and (max-width: #{$desktop-width - 1px}) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: #{$desktop-width}) {
    @content;
  }
}
  

html{
	margin: 0;
}
body{
	margin: 0;
	background: #fff;
}
#app {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
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

input{
	border-radius: 5px;
	height: 36px;
	border: none;
	background: #f8f8f8;
	box-shadow: none;
	padding: 0px 8px;
	font-size: 14px;
	margin-right: 8px;
	&:focus{
		outline: none;
	}
}

button{
	background: $orange;
	border: none;
	padding: 12px 18px;
	box-shadow: none;
	max-height: 40px;
	color: #fff;
	text-transform: uppercase;
	letter-spacing: 0.8px;
	font-size: 12px;
	font-weight: 600;
	border-radius: 5px;
	cursor: pointer;
}

.nav{
	position: absolute;
	top: 0;
	width: 100%;
	background: #f9f9f9;
	padding: 12px 0px 24px;
	.wrapper{
		max-width: 992px;
		margin: 0 auto;
		padding: 0px 12px;
	}
}

.nav__top{
	display: flex;
	align-items: center;
	padding: 0px;
	h1{
		margin-right: 8px;
		margin: 0px 8px 0px 0px;
		font-size: 22px;
		font-weight: bold;
	}
	h4{
		margin-left: auto;
		margin-right: 8px;
		margin: 0px 8px 0px auto;
	}

}

#navWarning{
	color: red;
	margin: 0;
	height: 0;
	overflow: hidden;
	&.show{
		margin: 8px 0px;
		height: auto;
		overflow: auto;
	}
}

.nav__bottom{
	padding: 0px;
	
	h2{
		font-size: 18px;
		margin: 24px 0px;
		@include phone{
			width: 100%;
			margin: 4px 0px;
		}
	}

	input{
		@include phone{
			width: 100%;
			margin: 4px 0px;
		}
	}

	button{
		@include phone{
			width: 100%;
			margin: 4px 0px;
		}
	}
}

.page-wrapper{
	padding-top: 75px;
	width: 100%;
	height: 100vh;
}

.notification-bar{
	width: 100%;
	position: fixed;
	display: flex;
	justify-content: center;
	z-index: 10;
	top: 24px;
	transition: 0.3s;
	section{
		max-width: 600px;
		border-radius: 5px;
		background: $orange;
		font-size: 14px;
		font-weight: 600;
		color: #fff;
		transition: 0.3s;
		height: 0;
		padding: 0;
		visibility: hidden;
		
		&.isOpen{
			height: auto;
			visibility: visible;
			padding: 12px 24px;
		}
		&.warning{
			background: red;
		}
		&.success{
			background: #00ff00;
		}

	}
}


</style>
