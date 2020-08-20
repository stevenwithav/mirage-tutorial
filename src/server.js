import { createServer } from 'miragejs';

export default function () {
	createServer({
		routes() {
			this.get('/api/reminders', () => ({
				reminders: [
					{ id: 1, text: 'Reminder 1' },
					{ id: 2, text: 'Reminder 2' },
					{ id: 3, text: 'Reminder 3' },
				],
			}));

			let newId = 4;
			this.post('api/reminders', (schema, request) => {
				let attrs = JSON.parse(request.requestBody);
				attrs.id = newId++;
				return { reminder: attrs };
			});
		},
	});
}
