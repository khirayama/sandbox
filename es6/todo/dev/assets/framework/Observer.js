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
	dispatch(payload){
    var event = '';
    let data = {};
    console.log(typeof payload);
    if(typeof payload === 'object') {
      event = payload.actionType;
      // TODO: make this simple.
      for(let key in payload) {
        if(key === 'actionType') continue;
        data[key] = payload[key];
      }
    } else if (typeof payload === 'string') {
      event = payload;
    } else {
      console.error('supply object or string');
    }
		this._events = this._events || {};
		if(event in this._events === false)	return;
		for(let i = 0; i < this._events[event].length; i++) {
			this._events[event][i].apply(this, [data]);
		}
	}
}
