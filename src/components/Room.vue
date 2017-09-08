<template>
	<div id="room">
		<template v-if='!chatAccess'>
			<button@click='joinChat'>Join Chat: {{ room.name }}</button>
		</template>
		<template v-if='user && chatAccess'>
			<!-- <p>User admin? {{ isAdmin}}</p> -->
			<div class="room__header">
				<div class="room__title">
					<h2>{{ room.name }}</h2>
				</div>
				<div class="wrapper">
					<ul class='room__list room__list--users'>
						<li><a @click='goBack'>Back</a></li>
						<!-- <li v-for='user in roomUsers'>{{ user.email }}</li> -->
					</ul>
					<ul class='room__list room__list--actions'>
						<li><a @click='showUsers = !showUsers'>{{ showUsers ? 'Hide':'View'}} Users</a></li>
						<li><a id="shareLink" :data-clipboard-text="pagePath">Invite someone</a></li>
						<li v-if='noOfUsers > 1'><a @click='leaveChat'>Leave Chat</a></li>	
					</ul>
				</div>
			</div>
			<div class="room__users" v-if='showUsers'>
				<a v-for='user in roomUsers'>{{ user.email }}</a>
			</div>
			<div id="room__chat">
				<div class="chat__main">
					<div class="wrapper" ref="chatWrapper" id='chatWrapper'>
						<div v-for='msg in room.msgs'class="chat__single">
							<div class="chat__text" :class="msg.user == user.uid ? 'chat__text--user':'chat__text--other'" >
								<h6 v-if='!(msg.user == user.uid)'>{{ getUser('email', msg.user) }}</h6>
								<p>{{ msg.text }}</p>
								<span>{{ showTimeCreated(msg.created_at) }}</span>
							</div>
						</div>
					</div>
				</div>
				<div class="chat__input">
					<div class="wrapper">
						<input id='sendText' type="text" name="message" v-model='pendingMsg.text' placeholder="Type something!">
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
import Clipboard from 'clipboard';

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
			scrolled: false,
			pagePath: window.location.href,
			showUsers: false
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
		},
		noOfUsers(){
			var vm = this;
			return	Object.keys(vm.room.users).length
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
		this.$nextTick(function(){
			this.initClipboard();
		});

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
				vm.openNotification('Successfully joined!!', 'success');
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
			var time = moment(date).format('HH:mm a');   
			return time;
		},
		initClipboard(){
			var clipboard = new Clipboard('#shareLink');
			var vm = this;

			clipboard.on('success', function(e) {
				vm.openNotification('Link copied to clipboard!', 'success')    
			    e.clearSelection();
			});
		},
		leaveChat(){
			var vm = this;
			var router = this.$router;
			var users = this.room.users;
			Object.keys(users).forEach(key => {
				if(users[key].id == vm.user.uid){
					var roomRef = this.firebase.database().ref('rooms/' + this.$route.params.roomId).child("users").child(key).remove();		
					roomRef.then(res=>{
						console.log('removed')
						router.push('/');
					}).catch(e=>{ console.log(e.msg)})

				}
			});
			this.openNotification('You have left the room: ' + this.room.name, 'success');
		},
		openNotification(text, type){
			var bar = document.getElementById('notificationBar');
			bar.className = 'isOpen ' + type;
			bar.innerHTML = text;

			setTimeout(function(){
				bar.className = '';
				bar.innerHTML = '';
			}, 4000)
		},
		goBack(){
			this.$router.push('/');
		}
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

#room {
	background: #fff;
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	position: relative;
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
	cursor: pointer;
}

.room__header{
	background: #f1f1f1;
	padding: 4px 0px 4px;

	.wrapper{
		display: flex;
		justify-content: left;
		max-width: 992px;
		margin: 0 auto;
		padding: 0px 12px;
	}
}

.room__list{
	margin: 4px 0px;
	li{
		display: block;
		text-align: left;
		a{
			@include phone{
				font-size: 12px;
			}
		}
		
	}
	&--actions{
		margin-left: auto;
		display: flex;
		align-items: center;
		li{
			display: inline;
			margin-left: 4px;
		}
	}
	&--users{

	}
}

.room__users{
	a{
		display: block;
		margin: 8px 0px;
	}
}

.room__title{
	text-align: center;
	h2{
		font-size: 18px;
		margin: 4px 0px;
		font-weight: 600;

	}
}


.chat__main{
	
	display: flex;
	justify-content: center;
	align-items: center;	
	flex-wrap: wrap;
	height: 400px;

	.wrapper{
		overflow: scroll;
		height: 100%;
		max-width: 992px;
		width: 100%;
		padding: 0px 12px;
	}
}

.chat__input{
	border-top: 1px solid #ddd;
	display: flex;
	justify-content: center;
	align-items: center;
	// position: fixed;
	// bottom: 0;
	width: 100%;
	background: #fff;

	.wrapper{
		max-width: 992px;
		padding: 16px 12px;
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
	flex-wrap: wrap;
	padding: 8px 0px;
	span,p,h6{
		width: 100%;
		margin: 4px;
		text-align: left;
	}
	span{
		font-size: 12px;
	}
	h6{
		font-size: 13px;
	}
 	p{	
		background: $orange;
		color: #fff;
		padding: 12px 20px;
		width: auto;
		text-align: left;
		font-weight: 600;
		border-radius: 6px;
	}

	&--user{
		p{
			margin-left: auto;
			text-align: right;
			max-width: 400px;
		}
		span,p,h6{
			text-align: right;
		}
	}
}

</style>
