<template>
	<div id="room">
		<template v-if='!user'>
			<h1>You are not part of this room.</h1>
		</template>
		<template v-if='user'>
			<h1>{{ room.name }}</h1>
			<div id="room__chat">
				<div class="chat__main">
					<div class="wrapper">
						<div v-for='msg in room.msgs'class="chat__single">
							<div class="chat__text" :class="msg.user == user.uid ? 'chat__text--user':'chat__text--other'" >
								<p>{{ msg.text }}</p>
							</div>
						</div>
					</div>
				</div>
				<div class="chat__input">
					<div class="wrapper">
						<input id='sendText' type="text" name="message" v-model='pendingMsg.text'>
						<button id='sendButton' :class="pendingMsg.text.length == 0 ? 'disabled':'' " @click='sendMessage'>Send</button>		
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script>

import * as Firebase from 'firebase'


export default {
	name: 'room',
	props: ['database', 'user'],
	firebase() {
		return{
			// simple syntax, bind as an array by default
    		// room: this.database.ref('rooms/' + this.$route.roomId),
    		room: {
		      source: this.database.ref('rooms/' + this.$route.params.roomId),
		      // optionally bind as an object
		      asObject: true,
		      // optionally provide the cancelCallback
		      cancelCallback: function () {},
		      // this is called once the data has been retrieved from firebase
		      readyCallback: function () {}
		    }
		}
	},
	data() {
		return {
			pendingMsg: {
				user: this.user.uid,
				text: ''
			}
		}
	},
	mounted () {
		// console.log(this.$route);
		// console.log(this.room);
	    // init the database client by given Firebase's API key
	    // this.db = Firebase.initializeApp({
	    //     apiKey: 'AIzaSyAGd3Ivm0HgTVF4y5HHhQKjdm0FyMzzcuE',
	    //     authDomain: 'chatrooom-f07b5.firebaseapp.com',
	    //     databaseURL: 'https://chatrooom-f07b5.firebaseio.com'
	    // })

	    // this.auth = this.db.auth();

	    // this.authState();

	},
	methods: {
		testing(){
			console.log('test');
		},
		sendMessage(){
			var vm = this;
			var input = document.getElementById('sendText');
			var button = document.getElementById('sendButton');
			// Check hasClass
			if ( (" " + button.className + " ").replace(/[\n\t]/g, " ").indexOf(" disabled ") > -1 ){
				return false;
			} 

			var roomRef = this.database.ref('rooms/' + this.$route.params.roomId).child("msgs").push().set(this.pendingMsg);

			this.pendingMsg.text = '';
		}
	}
}
</script>

<style lang="scss">

$orange: #f89414;

#room {
	background: #fff;
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
	padding: 40px 0px 16px;
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

$orange: #f89414;

.room__chat {
	background: #fff;
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
	padding: 40px 0px 16px;
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

.chat__main{
	
	display: flex;
	justify-content: center;
	align-items: center;	
	padding: 40px 0px 0px;
	flex-wrap: wrap;

	.wrapper{
		max-width: 992px;
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		border-bottom: 1px solid #ddd;
	}
}

.chat__input{
	padding: 16px 0px;
	display: flex;
	justify-content: center;
	align-items: center;

	.wrapper{
		max-width: 992px;
		width: 100%;
		display: flex;
	}
	input[type='text']{
		width: calc(100% - 180px);
		padding: 8px 12px;
		border: none;
		font-size: 16px;
		box-sizing: content-box;

		&:focus{
			border-bottom: 2px solid $orange;
			box-shadow: none;
			outline: none;
		}
	}
	button{
		margin-left: auto;
		width: 120px;
		font-size: 14px;
		padding: 12px 24px;
		background: $orange;
		border: none;
		color: #fff;
		text-transform: uppercase;
		letter-spacing: 2px;
		transition: 0.3s;
		&.disabled{
			opacity: 0.2
		}
	}

}

.chat__single{
	width: 100%;
}

.chat__text{
	display: flex;

 	p{
		
		background: $orange;
		color: #fff;
		padding: 12px 20px;
		width: auto;
		text-align: left;
		border-radius: 6px;
	}

	&--user{
		p{
			margin-left: auto;
			text-align: right;
			max-width: 400px;
		}
	}
}

</style>
