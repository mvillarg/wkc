import App from './App.svelte';

const app = new App({
	target: document.body,
	intro: true,	// This is needed for Svelte Transitions to work at startup
	props: {
		appName: 'World Kart Championship'
	}
});

export default app;