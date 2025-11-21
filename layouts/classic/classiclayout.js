// @ts-check
// ALL OK 2025-11-15
/**
 * Layout for classic unit profiles as known from the rulebooks; with inputs for desktop devices.
 */
class ClassicLayout extends OwcDesktopLayout
{
	/** @inheritdoc */
	static id = "classic";
}

owc.editor.registerLayout(ClassicLayout);
