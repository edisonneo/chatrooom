<template>
	<div id="room">
		<template v-if='!chatAccess'>
			<a @click='joinChat'>Join Chat</a>
		</template>
		<template v-if='user && chatAccess'>
			<p>User admin? {{ isAdmin}}</p>
			<ul>
				<li v-for='user in roomUsers'>{{ user.email }}</li>
			</ul>
			<a>Invite someone to chat</a>
			<a @click='leaveChat'>Leave Chat</a>
			<div id="room__chat">
				<div class="chat__main">
					<div class="wrapper" ref="chatWrapper" id='chatWrapper'>
						<div v-for='msg in room.msgs'class="chat__single">
							<div class="chat__text" :class="msg.user == user.uid ? 'chat__text--user':'chat__text--other'" >
								<span v-if='!(msg.user == user.uid)'>{{ getUser('email', msg.user) }}</span>
								<p>{{ msg.text }}</p>
								<h6>{{ showTimeCreated(msg.created_at) }}</h6>
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
import { mapState } from 'vuex';
import moment from 'moment';

export default {
	name: 'room',
	firebase() {
		return{
			// simple syntax, bind as an array by default
    		// room: this.database.ref('rooms/' + this.$route.roomId),
    		users: this.firebase.database().ref('users'),
    		room: {
    			source: this.firebase.database().ref('rooms/' + this.$route.params.roomId),
    			// optionally bind as an object
		     	asObject: true,
		      	// optionally provide the cancelCallback
		      	cancelCallback: function () {},
		      	// this is called once the data has been retrieved from firebase
		      	readyCallback: function () {
		      		this.checkUserAccessToChat(this.user);		      		
		      		this.checkIfUserIsAdmin(this.user);
		      		this.$nextTick(function () {
						// this.scrollChatToBottom();

					})
		      	}
		    }
		}
	},
	data() {
		return {
			pendingMsg: {
				text: ''
			},
			chatAccess: false,
			isAdmin: false,
			scrolled: false
		}
	},
	watch: {
        chatAccess(){
        	this.scrollChatToBottom();
            //code here executes whenever the uploads array changes 
            //and runs AFTER the dom is updated, could use this in
            //the parent component
        }
    },
	computed: {
		
		...mapState(['user','firebase']),

		roomUsers(){
			var vm = this
			var roomUsers = this.room.users;
			var result = []
			// console.log(Array.isArray(this.users));
			this.users.filter(user => {				
				Object.keys(roomUsers).forEach(key => {		
				    if(roomUsers[key].id == user['.key']){
				    	result.push(user);
				    }
				});
			});

			return result;
		}
	},
	created(){
		// var vm = this;
		// var msgRef = this.firebase.database().ref('rooms/' + this.$route.params.roomId).child("msgs");
		// msgRef.on('value', function(snapshot) {
		// 	console.log('messages changed');
		// });
	},
	mounted () {

	},
	updated(){
		if(this.$refs.chatWrapper){
			this.scrollChatToBottom();
		}
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

			this.pendingMsg.user = this.user.uid;
			this.pendingMsg.created_at = Firebase.database.ServerValue.TIMESTAMP;
			var roomRef = this.firebase.database().ref('rooms/' + this.$route.params.roomId).child("msgs").push().set(this.pendingMsg);
			
			roomRef.then(res => {
				this.scrollChatToBottom();
			});

			this.pendingMsg.text = '';
		
		},
		scrollChatToBottom(){
			
			this.$nextTick(function(){
				var chatWrapper = document.getElementById('chatWrapper');
				chatWrapper.scrollTop = chatWrapper.scrollHeight - chatWrapper.clientHeight;
			});
		},
		checkUserAccessToChat(user){
			var vm = this;
			var uid = user.uid;
			var users = this.room.users
			Object.keys(users).forEach(key => {
				if(users[key].id == vm.user.uid){
					vm.chatAccess = true;
				}
			})

			// users.forEach(function(user){
			// 	if(user.id == uid){
			// 		vm.chatAccess = true;
			// 	}
			// });
		},
		checkIfUserIsAdmin(user){
			var vm = this;
			var uid = user.uid;
			var admin = this.room.admin
			if(admin == uid){
				this.isAdmin = true;
			}
			else{
				this.isAdmin = false;
			}
		},
		joinChat(){
			var vm = this;
			var newUser = {
				id: vm.user.uid,
				status: 'active'
			}
			var roomRef = this.firebase.database().ref('rooms/' + this.$route.params.roomId).child("users").push().set(newUser);
			roomRef.then(res =>{
				vm.chatAccess = true;
				vm.scrollChatToBottom();		
			})	
			.catch(e =>{
				console.log(e);
			});
		},
		getUser(prop, userId){
			// console.log(userId);
			var user = this.users.filter(user=>{
				return(user['.key'] == userId);
				// console.log(user['.key'] == userId);
			});
			return user[0][prop];
		},
		showTimeCreated(date){
			var time = moment(date).fromNow();
			return time;
		},
		leaveChat(){
			var vm = this;
			var router = this.$router;
			var users = this.room.users;
			Object.keys(users).forEach(key => {
				if(users[key].id == vm.user.uid){
					
					var roomRef = this.firebase.database().ref('rooms/' + this.$route.params.roomId).child("users/" + key).remove();		
					roomRef.then(res=>{
						console.log('removed')
						router.push('/');
					}).catch(e=>{ console.log(e.msg)})

				}
			});
			



			


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
	margin-top: 40px;
	flex-wrap: wrap;
	height: 300px;

	.wrapper{
		overflow: scroll;
		height: 100%;
		max-width: 992px;
		width: 100%;
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
