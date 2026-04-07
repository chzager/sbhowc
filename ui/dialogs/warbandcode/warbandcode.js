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
	 * @override
	 * @param {string} code Warband text code to be shown in the bluebox.
	 */
	show (code)
	{
		super.render("/bluebox/warbandcode", {
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
					notifications.notify("The clipboard content was pasted.", "green");
				}
				catch (cause)
				{ // If we can't read the clipboard, then that's just how it is.
					console.error(cause);
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
