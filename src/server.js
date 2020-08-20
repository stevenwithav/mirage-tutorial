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
		},
	});
}
