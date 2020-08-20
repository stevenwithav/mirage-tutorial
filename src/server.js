import {
	createServer,
	Model,
	hasMany,
	belongsTo,
	RestSerializer,
} from 'miragejs';

export default function () {
	createServer({
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

		seeds(server) {
			server.create('reminder', { text: 'Reminder 1' });
			server.create('reminder', { text: 'Reminder 2' });
			server.create('reminder', { text: 'Reminder 3' });

			const listOne = server.create('list', { name: 'List 1' });
			server.create('reminder', { list: listOne, text: 'List 1 Reminder' });

			const listTwo = server.create('list', { name: 'List 2' });
			server.create('reminder', { list: listTwo, text: 'List 2 Reminder' });
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
