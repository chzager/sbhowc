// @ts-check
/**
 * Layout for unit profiles as a single table; with inputs for desktop devices.
 */
class ListLayout extends OwcDesktopLayout
{
	/** @inheritdoc */
	static id = "list";
}

owc.editor.registerLayout(ListLayout);
