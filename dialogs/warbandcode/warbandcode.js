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
					.then(() => owc.ui.notify("The warband code was copied to your clipboard.", "green"));
			},
			apply: () =>
			{
				if (owc.importWarband(
					this.element.querySelector("textarea").value
				))
				{
					owc.ui.notify("The warband code was imported.", "green");
					this.close();
				}
				else
				{
					owc.ui.notify("This is not a valid warband code.", "red");
				}
			},
		});
	}
};
