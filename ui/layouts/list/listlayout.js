/**
 * Layout for unit profiles as a single table; with inputs for desktop devices.
 */
class ListLayout extends OwcDesktopLayout
{
	/** @type {"list"} No more abstract. */
	static id = "list";
}

owc.editor.registerLayout(ListLayout);
