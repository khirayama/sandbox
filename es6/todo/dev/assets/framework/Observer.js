'use strict';

export default class Observer {
  on(event, callback) {
		this._events = this._events || {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(callback);
  }
	off(event, callback){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(callback), 1);
	}
	dispatch(event, data){
		this._events = this._events || {};
		if(event in this._events === false)	return;
		for(let i = 0; i < this._events[event].length; i++) {
			this._events[event][i].apply(this, [data]);
		}
	}
}
