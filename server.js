'use strict';


let cors = require('cors');
let path = require('path');
let express = require('express');
let request = require('request');
let querystring = require('querystring');
let cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;
const HOST = '127.0.0.1';
const stateKey = 'spotify_auth_state';
const client_id = '56da7acff2b54806b296c50b7df74049';
const client_secret = 'e1fbd157c2d34e1db672019bf2990e33';
const redirect_uri = 'http://127.0.0.1:8080/callback';

app.listen(PORT, HOST);

app.use(express.static(__dirname + '/dist')).use(cors()).use(cookieParser());
app.use(express.static(__dirname + '/tests'));
app.use(express.static(__dirname + '/node_modules'));

// CLIENT COLLECTION SAMPLE
app.get('/', (req, res) => {
	res.sendFile(
		path.join(__dirname + '/html/index.html')
	);
});

console.log(`Running on ${HOST}:${PORT}`);

var generateRandomString = function(length) {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
};


app.get('/login', function(req, res) {

	var state = generateRandomString(16);
	res.cookie(stateKey, state);

	var scope = 'user-read-private user-read-email';

	res.redirect('https://accounts.spotify.com/authorize?' +
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state
		}));
});

app.get('/callback', function(req, res) {
	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state === null || state !== storedState) {
		res.redirect('/#' + querystring.stringify({error: 'state_mismatch'}));
	} else {
		res.clearCookie(stateKey);

		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code'
			},
			headers: {
				'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
			},
			json: true
		};

		request.post(authOptions, function(error, response, body) {
			if (!error && response.statusCode === 200) {

				var access_token = body.access_token;
				var refresh_token = body.refresh_token;

				var options = {
					url: 'https://api.spotify.com/v1/me',
					headers: {
						'Authorization': 'Bearer ' + access_token
					},
					json: true
				};

				request.get(options, function(error, response, body) {
					console.log(body);
				});

				res.redirect('/#' + querystring.stringify({access_token: access_token, refresh_token: refresh_token}));

				return {
					access_token: access_token
				}
			} else {
				res.redirect('/#' + querystring.stringify({error: 'invalid_token'}));
			}
		});
	}
});
