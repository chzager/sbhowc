// @ts-check
// DOC entire file
const restorerBluebox = new class extends Bluebox
{
	/**
	 *
	 */
	show ()
	{
		/** @type {Map<string,OwcRestorerItem>} */
		const storageMap = new Map();
		for (const [key, str] of Object.entries(localStorage))
		{
			if (/^owc_#\w{8}$/.test(key))
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
		console.log(storageMap);


		const snippetData = {
			items: Array.from(storageMap.values()).sort((a, b) => a.title.localeCompare(b.title)),
			restoreItem: (/** @type {UIEvent} */evt) =>
			{
				if (evt.currentTarget instanceof HTMLElement)
				{
					const storageItem = storageMap.get(evt.currentTarget.dataset.hash);
					owc.pid = storageItem.foundIn[0].substring(5);
					const url = new URL(window.location.href);
					url.searchParams.set("pid", owc.pid);
					window.history.replaceState({}, "", url);
					owc.importWarband(storageItem.code);
					this.close();
				}
			},
			delete: (/** @type {UIEvent} */evt) =>
			{
				evt.stopImmediatePropagation();
				if (evt.currentTarget instanceof HTMLElement)
				{
					/** @type {HTMLElement} */
					const tr = evt.currentTarget.closest("[data-hash]");
					const storageItem = storageMap.get(tr.dataset.hash);
					for (const storageKey of storageItem.foundIn)
					{
						// console.log((!storageKey.includes(owc.pid)) ? "Would" : "would not", "delete", owc.pid, storageKey);
						// if (!storageKey.includes(owc.pid))
						// {
						localStorage.removeItem(storageKey);
						// }
					}
					tr.remove();
				}
			},
		};
		console.log(snippetData.items);
		super.open("/bluebox/restorer", snippetData);
	}
};
