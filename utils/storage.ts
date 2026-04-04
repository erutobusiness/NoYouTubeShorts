import { storage } from "wxt/utils/storage";

export const enabledStorage = storage.defineItem<boolean>("sync:enabled", {
	defaultValue: true,
});

export const blockCountStorage = storage.defineItem<number>("sync:blockCount", {
	defaultValue: 0,
});

export async function incrementBlockCount(): Promise<number> {
	const current = await blockCountStorage.getValue();
	const next = current + 1;
	await blockCountStorage.setValue(next);
	return next;
}

export async function resetBlockCount(): Promise<void> {
	await blockCountStorage.setValue(0);
}
