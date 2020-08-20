import {
	createServer,
	Model,
	hasMany,
	belongsTo,
	RestSerializer,
	Factory,
	trait,
} from 'miragejs';

export default function (environment = 'development') {
	return createServer({
		environment,
		serializers: {
			reminder: RestSerializer.extend({
				include: ['list'],
				embed: true,
			}),
		},

		models: {
			list: Model.extend({
				reminders: hasMany(),
			}),
			reminder: Model.extend({
				list: belongsTo(),
			}),
		},

		factories: {
			list: Factory.extend({
				name(i) {
					return `List ${i}`;
				},

				withReminders: trait({
					afterCreate(list, server) {
						server.createList('reminder', 5, { list });
					},
				}),
				// afterCreate(list, server) {
				//   if (!list.reminders.length) {
				//     server.createList('reminder', 5, { list });
				//   }
				// },
			}),
			reminder: Factory.extend({
				text(i) {
					return `Reminder ${i}`;
				},
			}),
		},

		seeds(server) {
			// server.createList('reminder', 20);
			server.create('reminder', { text: 'Custom reminder 1' });
			server.create('reminder', { text: 'Custom reminder 2' });
			server.create('reminder', { text: 'Custom reminder 3' });

			// server.create('list', {
			// 	reminders: server.createList('reminder', 5),
			// });

			server.create('list', {
				name: 'Custom List Name',
				reminders: [
					server.create('reminder', { text: 'Custom List / Custom Reminder' }),
				],
			});

			// server.create('list', 'withReminders');

			// const list = server.create('list', { name: 'List' });
			// server.create('reminder', { list, text: 'List Reminder' });
		},

		routes() {
			// reminders
			this.get('/api/reminders', (schema) => {
				return schema.reminders.all();
			});

			this.post('/api/reminders', (schema, request) => {
				const attrs = JSON.parse(request.requestBody);

				return schema.reminders.create(attrs);
			});

			this.delete('/api/reminders/:id', (schema, request) => {
				const id = request.params.id;
				return schema.reminders.find(id).destroy();
			});

			//lists
			this.get('/api/lists', (schema) => {
				return schema.lists.all();
			});

			this.get('/api/lists/:id/reminders', (schema, request) => {
				const listId = request.params.id;
				const list = schema.lists.find(listId);

				return list.reminders;
			});
		},
	});
}
