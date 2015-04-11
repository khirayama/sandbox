import User from './classes/user.js';
import Animal from './classes/animal.js';

var user = new User('Kotaro');
var animal = new Animal('Lion');
console.log('app ok ' + user.say() + ' and ' + animal.say());
