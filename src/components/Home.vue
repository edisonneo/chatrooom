<template>
	<div id="home">
		<p v-if='!user'>Please Log In or create an account.</p>
		<div v-if='user' class="wrapper">
			<div class="home__dashboard">
				<div class="home__section">
					<a @click='enterCreateMode'>New Chat Room</a>
					<template v-if='createRoomMode'>
						<input type="text" name="room-name" v-model='pendingRoom.name'>
						<button @click='createRoom'>Create</button>		
						<button @click='exitCreateMode'>Cancel</button>
					</template>					
				</div>
				<div class="home__section">
					<h2>Rooms</h2>
					<p v-if='userRooms.length == 0'>You are not in any rooms.</p>
					<ul class='home__list' v-if='userRooms.length > 0'>
						<li v-for='room in userRooms'>
							<a @click='enterRoom(room)'>{{ room.name }}</a> 
						</li>
					</ul>
				</div>
			</div>	
		</div>
	</div>
</template>

<script>

import { mapState } from 'vuex';

export default {
	name: 'home',
	props: ['authenticate'],
	firebase() {
		// const userId = firebase.auth().currentUser.uid
		return{
			// simple syntax, bind as an array by default
    		rooms: this.firebase.database().ref('rooms'),
		}
	},
	data() {
		return {
			createRoomMode: false,
			pendingRoom:{
				name: '',
				id: '',
				admin: '',
				users: []
			}
		}
	},
	mounted () {
	    this.authenticate.onAuthStateChanged(firebaseUser =>{
				if(firebaseUser){
					console.log('yes log in');
				}
				else{			
					console.log('no log in');
				}
		});

		// console.log(this.rooms[0].users);
	},
	computed: {
		
		...mapState(['user','firebase']),

		userRooms() {
			var vm = this;
			var result = [];
			var userRooms = this.rooms.filter(function(room) {
				var users = room.users;
				Object.keys(users).forEach(key => {
					if(users[key].id == vm.user.uid){
						result.push(room);
					}
				})
			});
			
			return result;
		}
	},
	methods: {
		testing(){
			console.log('test');
		},
		enterCreateMode(){
			this.createRoomMode = true;

		},
		exitCreateMode(){
			this.pendingRoom.name = '';
			this.pendingRoom.users = [];
			this.createRoomMode = false;


		},
		createRoom(){		
			var vm = this;
			var user = vm.user;
			var invalid = false;
			
			this.rooms.forEach(room =>{
				if(this.pendingRoom.name == room.name){
					vm.openNotification('Room name exists. Please try another name.','warning')
					invalid = true;
				}
			})

			if(this.pendingRoom.name == ''){
				vm.openNotification('Room name is empty','warning');
				invalid = true;
			}

			if(!invalid){
				var adminUser = {
					status: "active",
					id: user.uid,					
				}

				this.pendingRoom.users.push(adminUser);
				this.pendingRoom.admin = user.uid;
				console.log(this.pendingRoom);
		
				var roomRef = this.firebase.database().ref('rooms').push();
				this.pendingRoom.id = roomRef.key;
				roomRef.set(this.pendingRoom);				
				this.exitCreateMode();
				vm.openNotification('Room ' + this.pendingRoom.name + 'created!!', 'success');
			}	
		},
		enterRoom(room){
			// router.push({ name: 'user', params: { userId }}) // -> /user/123
			var router = this.$router;
			var roomId = room.id;
			router.push({ name: 'rooms', params: { roomId }}) // -> /user/123
			// router.push('rooms') // -> /user/123
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
	}
}
</script>

<style lang="scss">

$orange: #f89414;

#home {
	background: #fff;
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	padding: 40px 0px 16px;

	.wrapper{

		max-width: 992px;
		width: 100%;
		margin: 0 auto;
	}
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

.home__section{
	text-align: left;
	background: rgba(0,0,0,0.0125);
	margin-bottom: 24px;
	padding: 8px;
	border-radius: 10px;
	h2{
		margin: 8px 0px;
	}
	input{
		background: #eee;
	}
}


.home__list{
	li{
		display: block;
		margin-bottom: 12px;
		margin-left: 0px;
	}
}

</style>
