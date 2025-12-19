// @ts-check
/**
 * Bluebox that shows a warband's text code. For copying and pasting.
 */
const warbandcodeBluebox = new class extends Bluebox
{
	/** @returns The `<textarea>` element on this bluebox to provide or take the warband text code. */
	get #textarea ()
	{
		return this.element.querySelector("textarea");
	}

	/**
	 * Pops up the bluebox.
	 * @param {string} code Warband text code to be shown in the bluebox.
	 */
	show (code)
	{
		super.open("/bluebox/warbandcode", {
			code: code,
			copyToClipboard: async () =>
			{
				await navigator.clipboard?.writeText?.(this.#textarea.value);
				notifications.notify("The warband code was copied to your clipboard.", "green");
			},
			pasteFromClipboard: async () =>
			{
				try
				{
					const text = await navigator.clipboard.readText();
					this.#textarea.value = text;
				}
				catch (error)
				{
					console.error(error);
					notifications.notify("Failed to read clipboard.", "red");
				}
			},
			apply: () =>
			{
				if (owc.importWarband(this.#textarea.value))
				{
					notifications.notify("The warband code was imported.", "green");
					this.close();
				}
				else
				{
					notifications.notify("This is not a valid warband code.", "red");
				}
			},
		});
	}
};
