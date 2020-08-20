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

	// screen.debug();

	await waitForElementToBeRemoved(() =>
		screen.getByTestId('new-reminder-text')
	);
	expect(screen.getByText('New Reminder')).toBeInTheDocument();
	expect(server.db.reminders.length).toEqual(1);
	expect(server.db.reminders[0].listId).toEqual(list.id);
});

test('the all acreen shows list tags', async () => {
	server.create('reminder', { text: 'Reminder 1' });

	const list = server.create('list', { name: 'List 1' });
	server.create('reminder', { text: 'Reminder 2', list });

	visit('/');
	await waitForElementToBeRemoved(() => screen.getByText('Loading...'));
	const [reminder1, reminder2] = screen.getAllByTestId('reminder');

	expect(reminder1).toHaveTextContent('Reminder 1');
	expect(reminder2).toHaveTextContent('Reminder 2');
	expect(reminder2.querySelector('[data-testid=list-tag]')).toHaveTextContent(
		'List 1'
	);
});

test('it can delete a reminder', async () => {
	server.create('reminder', { text: 'Reminder to delete' });
	visit('/');

	await waitForElementToBeRemoved(() => screen.getByText('Loading...'));
	userEvent.click(screen.getByTestId('delete-reminder'));

	expect(screen.queryByText('Reminder to delete')).not.toBeInTheDocument();
	expect(server.db.reminders.length).toEqual(0);
});

test('it can create a list', async () => {
	visit('/');
	await waitForElementToBeRemoved(() => screen.getByText('Loading...'));

	userEvent.click(screen.getByTestId('toggle-sidebar'));
	userEvent.click(screen.getByTestId('add-list'));
	await userEvent.type(screen.getByTestId('new-list-text'), 'Home');
	userEvent.click(screen.getByTestId('save-new-list'));

	await waitForElementToBeRemoved(() => screen.getByTestId('new-list-text'));

	expect(screen.getByTestId('active-list-title')).toHaveTextContent('Home');
	expect(server.db.lists.length).toEqual(1);
});

test('a list shows only its own reminders', async () => {
	server.create('reminder');

	const list = server.create('list', {
		reminders: server.createList('reminder', 3),
	});

	visit(`/${list.id}?open`);
	await waitForElementToBeRemoved(() => screen.getByText('Loading...'));

	expect(screen.getAllByTestId('reminder').length).toEqual(3);
});

test('it can delete a list', async () => {
	server.create('reminder');

	const list = server.create('list', {
		reminders: server.createList('reminder', 3),
	});

	visit(`/${list.id}?open`);
	await waitForElementToBeRemoved(() => screen.getByText('Loading...'));

	userEvent.click(screen.getByTestId('delete-list'));

	await waitForElementToBeRemoved(() => screen.getByText('Loading...'));

	expect(screen.getByTestId('active-list-title')).toHaveTextContent(
		'Reminders'
	);
	expect(screen.getAllByTestId('reminder').length).toEqual(1);
	// No lists should remain
	expect(server.db.lists.length).toEqual(0);
	// Only one reminder should remain
	expect(server.db.reminders.length).toEqual(1);
});
