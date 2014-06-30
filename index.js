
/**
 * Module dependencies.
 */

var Emitter = require('emitter');

module.exports = WebSocketWrapper;

/**
 * Create a WebSocket to optional `host`,
 * defaults to current page.
 *
 * @param {String} host
 * @return {Object} ws
 * @api public
 */

function WebSocketWrapper(url) {
	if (!(this instanceof WebSocketWrapper))
		return new WebSocketWrapper(url);

	Emitter.call(this);

	this.url = url;
	this._socket = undefined;
	this._connect();
}
WebSocketWrapper.prototype = Object.create(Emitter.prototype);

// wrap the states
WebSocketWrapper.prototype.CONNECTING = 0;
WebSocketWrapper.prototype.OPEN = 1;
WebSocketWrapper.prototype.CLOSING = 2;
WebSocketWrapper.prototype.CLOSED = 3;

// wrap readyState
Object.defineProperty(WebSocketWrapper.prototype, 'readyState', {
	enumerable: true,
	get: function () {
		return this._socket ? this._socket.readyState : this.CLOSED;
	}
});

// wrap this for easier extensibility
WebSocketWrapper.prototype.send = function WebSocketWrapper_send(msg) {
	this._send(msg);
};

/**
 * Connect the websocket and hook up the events
 */
WebSocketWrapper.prototype._connect = function WebSocketWrapper__connect() {
	// maybe close and re-open?
	if (this.readyState === this.OPEN)
		return;
	var self = this;
	var socket;
	try {
		socket = new WebSocket(this.url);
	}
	catch (err) {
		return setTimeout(function(){
			self.emit('error', err);
		}, 0);
	}

	socket.onmessage = function (message) { self.emit('message', message.data); };
	socket.onopen = function (e) { self.emit('open', e); };
	socket.onclose = function (e) { self.emit('close', e); };
	socket.onerror = function (e) { self.emit('error', e); };

	this._socket = socket;
	this._send = socket.send.bind(socket);
};

