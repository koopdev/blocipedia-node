const Wiki = require('./models').Wiki;
const User = require('./models').User;
const Collaborator = require('./models').Collaborator;
const Authorizer = require('../policies/wiki');

module.exports = {
	getAllWikis(callback) {
		return Wiki.all()
			.then(wikis => {
				callback(null, wikis);
			})
			.catch(err => {
				callback(err);
			});
	},

	getWiki(id, callback) {
		let result = {};

		return Wiki.findById(id)
			.then(wiki => {
				if (!wiki) {
					callback(404);
				} else {
					result['wiki'] = wiki;
					Collaborator.scope({ method: ['collaboratorsFor', id] })
						.all()
						.then(collaborators => {
							result['collaborators'] = collaborators;
							callback(null, result);
						});
				}
			})
			.catch(err => {
				callback(err);
			});
	},

	addWiki(newWiki, callback) {
		return Wiki.create({
			title: newWiki.title,
			body: newWiki.body,
			private: newWiki.private,
			userId: newWiki.userId,
		})
			.then(wiki => {
				callback(null, wiki);
			})
			.catch(err => {
				callback(err);
			});
	},

	deleteWiki(req, callback) {
		return Wiki.findById(req.params.id)
			.then(wiki => {
				const authorized = new Authorizer(req.user, wiki).destroy();

				if (authorized) {
					wiki.destroy().then(res => {
						callback(null, wiki);
					});
				} else {
					req.flash('notice', 'You are not authorized to do that.');
					callback(401);
				}
			})
			.catch(err => {
				callback(err);
			});
	},

	privateToPublic(id) {
		return Wiki.all()
			.then(wikis => {
				wikis.forEach(wiki => {
					if (wiki.userId == id && wiki.private == true) {
						wiki.update({
							private: false,
						});
					}
				});
			})
			.catch(err => {
				callback(err);
			});
	},

	updateWiki(req, updatedWiki, callback) {
		return Wiki.findById(req.params.id).then(wiki => {
			if (!wiki) {
				console.log('wikiQueries.updateWiki !wiki');
				return callback('Wiki not found');
			}
			const authorized = new Authorizer(req.user, wiki).update();

			if (authorized) {
				// console.log('wikiQueries.updateWiki authorized passed');
				wiki
					.update(updatedWiki, {
						fields: Object.keys(updatedWiki),
					})
					.then(() => {
						callback(null, wiki);
					})
					.catch(err => {
						console.log('wikiQueries.updateWiki catch err: ' + err);

						callback(err);
					});
			} else {
				console.log('wikiQueries.updateWiki authorized failed');
				req.flash('notice', 'You are not authorized to do that.');
				callback('Forbidden');
			}
		});
	},
};
