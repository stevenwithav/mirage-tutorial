import MutationObserver from '@sheerun/mutationobserver-shim';
import { visit } from '../lib/test-helpers';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import makeServer from '../server';

window.MutationObserver = MutationObserver;

let server;

beforeEach(() => {
	server = makeServer('test');
});

afterEach(() => {
	server.shutdown();
});

test('it shows a message when there are no reminders', async () => {
	visit('/');
	await waitForElementToBeRemoved(() => screen.getByText('Loading...'));

	expect(screen.getByText('All done!')).toBeInTheDocument();
});

test('it shows existing reminders', async () => {
	server.create('reminder', { text: 'Custom reminder 1' });
	server.create('reminder', { text: 'Custom reminder 2' });
	server.create('reminder', { text: 'Custom reminder 3' });

	visit('/');
	await waitForElementToBeRemoved(() => screen.getByText('Loading...'));

	expect(screen.getByText('Custom reminder 1')).toBeInTheDocument();
	expect(screen.getByText('Custom reminder 2')).toBeInTheDocument();
	expect(screen.getByText('Custom reminder 3')).toBeInTheDocument();
});

test('it can add a  reminder to a list', async () => {
	const list = server.create('list');

	visit(`/${list.id}?open`);
	await waitForElementToBeRemoved(() => screen.getByText('Loading...'));

	userEvent.click(screen.getByTestId('add-reminder'));
	await userEvent.type(screen.getByTestId('new-reminder-text'), 'New Reminder');
	userEvent.click(screen.getByTestId('save-new-reminder'));

	screen.debug();

	await waitForElementToBeRemoved(() =>
		screen.getByTestId('new-reminder-text')
	);
	expect(screen.getByText('New Reminder')).toBeInTheDocument();
	expect(server.db.reminders.length).toEqual(1);
	expect(server.db.reminders[0].listId).toEqual(list.id);
});
