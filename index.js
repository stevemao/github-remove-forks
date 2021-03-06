'use strict';
var eachAsync = require('each-async');
var githubRepos = require('github-repositories');
var githubTokenUser = require('github-token-user');
var got = require('gh-got');

function deleteRepo(repo, opts, cb) {
	var url = 'repos/' + repo;

	got.delete(url, {headers: opts.headers}, function (err) {
		if (err) {
			cb(err);
			return;
		}

		cb();
	});
}

function run(repos, opts, cb) {
	eachAsync(repos, function (repo, i, next) {
		deleteRepo(repo.full_name, opts, next);
	}, function (err) {
		if (err) {
			cb(err);
			return;
		}

		cb(null, repos);
	});
}

module.exports = function (opts, cb) {
	opts = opts || {};

	if (!opts.token) {
		throw new Error('Token is required to authenticate with Github');
	}

	opts.headers = {
		Authorization: 'token ' + opts.token
	};

	githubTokenUser(opts.token, function (err, data) {
		if (err) {
			cb(err);
			return;
		}

		githubRepos(data.login, {token: opts.token}, function (err, repos) {
			if (err) {
				cb(err);
				return;
			}

			repos = repos.filter(function (el) {
				return el.fork;
			});

			run(repos, opts, cb);
		});
	});
};
