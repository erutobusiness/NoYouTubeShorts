/**
 * Popup: one switch per behaviour.
 *
 * Changes are written as soon as a switch moves. The content script listens on
 * `chrome.storage.onChanged`, so an open YouTube tab updates without a reload.
 */

import "./popup.css";
import {
	SETTING_LABELS,
	type Settings,
	loadSettings,
	saveSetting,
} from "./settings";

const list = document.getElementById("settings");
const status = document.getElementById("status");

function announce(message: string): void {
	if (!status) return;
	status.textContent = message;
	// Clearing it keeps the message from reading as the permanent state of things.
	window.setTimeout(() => {
		if (status.textContent === message) status.textContent = "";
	}, 1500);
}

function renderRow(
	settings: Settings,
	item: (typeof SETTING_LABELS)[number],
): HTMLLIElement {
	const row = document.createElement("li");

	const label = document.createElement("label");
	const input = document.createElement("input");
	input.type = "checkbox";
	input.checked = settings[item.key];

	const text = document.createElement("span");
	text.className = "label-text";
	text.textContent = item.label;

	label.append(input, text);
	row.append(label);

	if (item.note) {
		const note = document.createElement("p");
		note.className = "note";
		note.textContent = item.note;
		row.append(note);
	}

	input.addEventListener("change", async () => {
		input.disabled = true;
		try {
			await saveSetting(item.key, input.checked);
			announce(input.checked ? "オンにしました" : "オフにしました");
		} catch {
			// Put the switch back so it never shows a state that was not stored.
			input.checked = !input.checked;
			announce("保存できませんでした");
		} finally {
			input.disabled = false;
		}
	});

	return row;
}

async function main(): Promise<void> {
	if (!list) return;
	const settings = await loadSettings();
	for (const item of SETTING_LABELS) {
		list.append(renderRow(settings, item));
	}
}

main();
