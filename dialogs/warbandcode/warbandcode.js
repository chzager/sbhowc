// @ts-check
// DOC entire file
const warbandcodeBluebox = new class extends Bluebox
{
	/**
	 *
	 * @param {string} code
	 */
	show (code)
	{
		super.open("/bluebox/warbandcode", {
			code: code,
			copyToClipboard: () =>
			{
				const textElement = this.element.querySelector("textarea");
				navigator.clipboard?.writeText?.(textElement.value)
					.then(() => notifications.notify("The warband code was copied to your clipboard.", "green"));
			},
			pasteFromClipboard: async () =>
			{
				try
				{
					const text = await navigator.clipboard.readText();
					this.element.querySelector("textarea").value = text;
				}
				catch (error)
				{
					console.error(error);
					notifications.notify("Failed to read clipboard.", "red");
				}
			},
			apply: () =>
			{
				if (owc.importWarband(this.element.querySelector("textarea").value))
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
