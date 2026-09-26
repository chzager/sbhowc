/**
 * Bluebox for restoring sessions that are stored in the browser's `localStorage`.
 * @see {@linkcode OwcEditor.storeWarbandInBrowser()}
 */
const restorerBluebox = new class extends Bluebox
{
	/** @override */
	show ()
	{
		/** @type {Map<string,OwcRestorerItem>} */
		const storageMap = new Map();
		for (const [key, str] of Object.entries(localStorage))
		{
			if (/^owc_#\w{6}$/.test(key))
			{
				/** @type {OwcLocalstorageData} */
				const data = JSON.parse(str);
				const hash = stringHash(data.data).toString();
				storageMap.has(hash) || storageMap.set(hash, {
					hash: hash,
					title: owc.localizer.nonBlankWarbandName(data.title),
					code: data.data,
					figures: data.figures,
					points: data.points,
					foundIn: []
				});
				storageMap.get(hash).foundIn.push(key);
			}
		}
		super.render("/bluebox/restorer", {
			items: Array.from(storageMap.values()).sort((a, b) => a.title.localeCompare(b.title)),
			restoreItem: (/** @type {UIEvent} */ev) =>
			{
				const storageItem = storageMap.get(ev.currentTarget.dataset.hash);
				owc.pid = storageItem.foundIn[0].substring(5);
				const url = new URL(window.location.href);
				url.searchParams.set("pid", owc.pid);
				window.history.replaceState({}, "", url);
				owc.importWarband(storageItem.code);
				this.close();
			},
			delete: (/** @type {UIEvent} */ev) =>
			{
				ev.stopImmediatePropagation();
				const tr = ev.currentTarget.closest("[data-hash]");
				const storageItem = storageMap.get(tr.dataset.hash);
				for (const storageKey of storageItem.foundIn)
				{
					localStorage.removeItem(storageKey);
				}
				tr.remove();
			},
			close: () =>
			{
				this.close();
			}
		});
	}
};
