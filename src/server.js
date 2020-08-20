import { createServer, Model } from 'miragejs';

export default function () {
	createServer({
		models: {
			reminder: Model,
		},

		seeds(server) {
			server.create('reminder', { text: 'Reminder 1' });
			server.create('reminder', { text: 'Reminder 2' });
			server.create('reminder', { text: 'Reminder 3' });
		},

		routes() {
			this.get('/api/reminders', (schema) => {
				// console.log(schema);
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
		},
	});
}
